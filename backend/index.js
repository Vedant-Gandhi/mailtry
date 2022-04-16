const express = require("express");
const cors = require("cors");
const jsonwebtoken = require("jsonwebtoken");

const { sendEmail } = require("./auth");
const {
  insertCache,
  checkCache,
  getCacheValue,
  deleteCache,
} = require("./cache");
const { initDb, createUser, getUser, updateUser } = require("./database");
const { errorCodes, hashPassword, compareHashedPasswords } = require("./utils");

require("dotenv-flow").config();

const server = express();

server.use(express.json());
server.use(cors());

server.post("/user/new", async (req, res) => {
  try {
    if (
      !req.body.username ||
      !req.body.password ||
      !req.body.email ||
      !req.body.otp
    ) {
      res.send(400).send({ isError: true, ...errorCodes.INVALID_DATA });
    }

    let data = {
      username: req.body.username,
      password: await hashPassword(req.body.password),
      email: req.body.email,
      otp: req.body.otp,
    };

    if (Boolean(await checkCache(data.email))) {
      const otp = await getCacheValue(data.email);
      if (data.otp == otp) {
        const dbInsert = await createUser(data);
        await deleteCache(data.email);
        res.status(201).send();
        return;
      }
    }
    res.status(200).send({ isError: false, ...errorCodes.NOT_CREATED });
  } catch (error) {
    console.error(error);
    res.status(500).send({ isError: true, ...errorCodes.INTERNAL_ERROR });
  }
});

server.post("/verify/email", async (req, res) => {
  try {
    const email = req.body.email;

    const otp = await sendEmail(email);
    if (otp.isSuccess) {
      var cacheResult = await insertCache(otp.email, otp.otp);
    }
    res.status(200).send({
      isError: false,
      code: otp.isSuccess ? "OTP_SENT" : "OTP_NOT_SENT",
      message: otp.isSuccess
        ? "OTP has been sent successfully"
        : "Failed to sent OTP",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ isError: true, ...errorCodes.INTERNAL_ERROR });
  }
});

server.post("/user/login", async (req, res) => {
  const email = req.body.email;
  const password_ = req.body.password;

  try {
    const result = await getUser(email);

    if (result) {
      const password = await compareHashedPasswords(password_, result.password);
      if (password) {
        res.status(200).send();
        return;
      }
      res
        .status(401)
        .send({ code: "FAILED_AUTH", message: "Failed Authentication" });
      return;
    }
    res.status(404).send();
  } catch (error) {
    console.error(error);
    res.status(500).send({ isError: true, ...errorCodes.INTERNAL_ERROR });
  }
});

server.post("/user/update", async (req, res) => {
  const email = req.body.email;

  try {
    const result = await getUser(email);

    if (result) {
      let newData = {
        username: req.body.username || result.username,
        password: (await hashPassword(req.body.password)) || result.password,
      };
      let updatedUser = await updateUser(email, newData);
      res.send();
      return;
    }
    res.status(404).send();
  } catch (error) {
    console.error(error);
    res.status(500).send({ isError: true, ...errorCodes.INTERNAL_ERROR });
  }
});
initDb().then(() => {
  server.listen(process.env.PORT, () => {
    console.log(`Server started at ${process.env.PORT}`);
  });
});
