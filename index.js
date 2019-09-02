const express = require("express");
const nodemailer = require("nodemailer");
const validator = require("email-validator");
const fs = require("fs");
const app = express();

app.use(express.json());
app.use(express.static("../public"));
app.get("/", res => res.render("index"));

app.get("/projects", (req, res) => {
  res.set({
    "Access-Control-Allow-Origin": "*"
  });
  res.status(200).send(JSON.parse(fs.readFileSync("projects.json")));
});

app.post("/contact", function(req, res) {
  if (!req.body.name || !req.body.email || !req.body.message) {
    res.status(200).send({
      title: "contact",
      err: true,
      page: "contact",
      type: "empty",
      body: req.body.message,
      name: req.body.name,
      email: req.body.email,
      msg: "Please fill all the details...",
      description: "email"
    });
    return;
  }
  var contacts = JSON.parse(fs.readFileSync("contacts.json"));
  contacts.push({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message
  });
  fs.writeFile("contacts.json", JSON.stringify(contacts), err =>
    console.log(err)
  );
  // check valid email
  var email_check = validator.validate(req.body.email);

  if (email_check == false) {
    res.send({
      title: "contact",
      err: true,
      page: "contact",
      type: "empty",
      body: req.body.message,
      name: req.body.name,
      email: req.body.email,
      msg: "Please fill valid email id...",
      description: "email"
    });

    return;
  }

  //set up smtp mailer
  var mailOpts, smtpTrans;

  //setup nodemailer transport, (gmail)
  // app-specific password
  smtpTrans = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "",
      pass: ""
    }
  });

  // fill mail options
  mailOpts = {
    from: req.body.name + "&lt" + req.body.email + "&gt",
    to: "jk031997@gmail.com",
    subject: "Website content",
    text:
      req.body.message +
      " || NAME:" +
      req.body.name +
      "|| EMAIL:" +
      req.body.email
  };

  smtpTrans.sendMail(mailOpts, function(error, info) {
    //email not sent
    if (error) {
      res.status(404).send({
        title: "contact",
        page: "contact",
        type: "error",
        description: "email not sent"
      });
    }
    // sent
    else {
      res.send({
        title: "contact",
        page: "contact",
        type: "success",
        description: "successfully sent mail"
      });
    }
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("server is up");
});
