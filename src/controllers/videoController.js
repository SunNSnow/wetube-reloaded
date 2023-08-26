export const trending = (req, res) => res.render("home");
export const see = (req, res) => res.render("watch");
export const edit = (req, res) => res.render("edit");
export const search = (req, res) => res.send("Search Video");
export const remove = (req, res) => {
  return res.send(`Remove Video ${req.params.id}`);
};
export const upload = (req, res) => res.send("Upload Video");
