import bcrypt from "bcrypt";

import User from "../models/User";

export const getJoin = (req, res) =>
  res.render("users/join", { pageTitle: "Join" });

export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: "Password confirmation does not match",
    });
  }
  const existsUN = await User.exists({ username });
  const existsEM = await User.exists({ email });
  if (existsUN) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: "This username is already taken.",
    });
  } else if (existsEM) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: "This email is already taken.",
    });
  }
  try {
    await User.create({ name, username, email, password, location });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};

export const getLogIn = (req, res) => {
  return res.render("users/login", { pageTitle: "Log In" });
};

export const postLogIn = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Log In";
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).render("users/login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("users/login", {
      pageTitle,
      errorMessage: "Wrong Password.",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogIn = (req, res) => {
  const baseURL = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalURL = `${baseURL}?${params}`;
  return res.redirect(finalURL);
};

export const finishGithubLogIn = async (req, res) => {
  const baseURL = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalURL = `${baseURL}?${params}`;
  const tokenRequest = await (
    await fetch(finalURL, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiURL = "https://api.github.com";
    const userData = await (
      await fetch(`${apiURL}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiURL}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      const user = await User.create({
        name: userData.name ? userData.name : "Unknown",
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
        avatarURL: userData.avatar_url,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.flash("info", "You just Log Out.");
  req.session.destroy();
  return res.redirect("/");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      midel: "User",
    },
  });
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User Not Found" });
  }
  res.render("users/profile", {
    pageTitle: user.username,
    user,
  });
};

export const getEdit = (req, res) => {
  return res.render("users/edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarURL },
    },
    body: { name, email, username, location },
    file,
  } = req;
  const pageTitle = "Edit Profile";
  const updatingUser = req.session.user;
  if (updatingUser.username !== username) {
    const existsUN = await User.exists({ username });
    if (existsUN) {
      return res.status(400).render("users/edit-profile", {
        pageTitle,
        errorMessage: "Username already exists.",
      });
    }
  } else if (updatingUser.email !== email) {
    const existsEM = await User.exists({ email });
    if (existsEM) {
      return res.status(400).render("users/edit-profile", {
        pageTitle,
        errorMessage: "E-mail already exists.",
      });
    }
  }
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      name,
      email,
      username,
      location,
      avatarURL: file
        ? process.env.NODE_ENV
          ? file.location
          : file.path
        : avatarURL,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  return res.redirect(`/users/${_id}/edit`);
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly) {
    req.flash("error", "Can't Change Password.");
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id, password },
    },
    body: { oldPassword, newPassword, confirmPassword },
  } = req;
  const ok = await bcrypt.compare(oldPassword, password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect.",
    });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the confirmation.",
    });
  }
  const user = await User.findById(_id);
  user.password = newPassword;
  await user.save();
  password = user.password;
  req.flash("info", "Password Updated.");
  return res.redirect("/");
};

export const remove = (req, res) => res.send("Remove User");
