const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const fetch = require("node-fetch");

const {
  RtcTokenBuilder,
  RtcRole,
  RtmTokenBuilder,
  RtmRole,
} = require("agora-token");

const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;
const AGORA_API_KEY = process.env.AGORA_API_KEY;
const AGORA_API_SECRET = process.env.AGORA_API_SECRET;

// console.log("env: ", PORT, APP_ID, APP_CERTIFICATE);

const nocache = (_, resp, next) => {
  resp.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  //resp.header("Expires", "-1");
  resp.header("Pragma", "no-cache");
  next();
};

const ping = (req, resp) => {
  resp.send({ message: "pong" });
};

const generateRTCToken = (req, resp) => {
  // set response header
  resp.header("Access-Control-Allow-Origin", "*");
  // get channel name
  const channelName = req.params.channel;
  if (!channelName) {
    return resp.status(400).json({ error: "channel is required" });
  }
  // get uid
  let uid = req.params.uid;
  if (!uid || uid === "") {
    return resp.status(400).json({ error: "uid is required" });
  }
  // get role
  let role;
  if (req.params.role === "publisher") {
    role = RtcRole.PUBLISHER;
  } else if (req.params.role === "audience") {
    role = RtcRole.SUBSCRIBER;
  } else {
    return resp.status(400).json({ error: "role is incorrect" });
  }
  // get the expire time
  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === "") {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  // build the token
  let token;
  if (req.params.tokentype === "userAccount") {
    token = RtcTokenBuilder.buildTokenWithAccount(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      role,
      privilegeExpireTime
    );
  } else if (req.params.tokentype === "uid") {
    token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      role,
      privilegeExpireTime
    );
  } else {
    return resp.status(400).json({ error: "token type is invalid" });
  }
  // return the token
  return resp.json({ rtcToken: token });
};

const generateRTMToken = (req, resp) => {
  // set response header
  resp.header("Access-Control-Allow-Origin", "*");

  // get uid
  let uid = req.params.uid;
  if (!uid || uid === "") {
    return resp.status(400).json({ error: "uid is required" });
  }
  // get role
  let role = RtmRole.Rtm_User;
  // get the expire time
  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === "") {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  // build the token
  console.log(APP_ID, APP_CERTIFICATE, uid, role, privilegeExpireTime);
  const token = RtmTokenBuilder.buildToken(
    APP_ID,
    APP_CERTIFICATE,
    uid,
    role,
    privilegeExpireTime
  );
  // return the token
  return resp.json({ rtmToken: token });
};

const generateRTEToken = (req, resp) => {
  // set response header
  resp.header("Access-Control-Allow-Origin", "*");
  // get channel name
  const channelName = req.params.channel;
  if (!channelName) {
    return resp.status(400).json({ error: "channel is required" });
  }
  // get uid
  let uid = req.params.uid;
  if (!uid || uid === "") {
    return resp.status(400).json({ error: "uid is required" });
  }
  // get role
  let role;
  if (req.params.role === "publisher") {
    role = RtcRole.PUBLISHER;
  } else if (req.params.role === "audience") {
    role = RtcRole.SUBSCRIBER;
  } else {
    return resp.status(400).json({ error: "role is incorrect" });
  }
  // get the expire time
  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === "") {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  // build the token
  const rtcToken = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );
  const rtmToken = RtmTokenBuilder.buildToken(
    APP_ID,
    APP_CERTIFICATE,
    uid,
    role,
    privilegeExpireTime
  );
  // return the token
  return resp.json({ rtcToken: rtcToken, rtmToken: rtmToken });
};

const getChannelUsers = async (req, res) => {
  const url = `https://api.agora.io/dev/v1/channel/user/${APP_ID}/${req.params.channelName}`;
  console.log("url: ", url);
  const plainCredential = AGORA_API_KEY + ":" + AGORA_API_SECRET;
  const encoded = Buffer.from(plainCredential).toString("base64");

  const data = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Basic ${encoded}`,
      "Content-Type": "application/json",
    },
  });
  const data2 = await data.json();
  console.log("dat:" + data2.success);
  return res.json(data2.data);
};

const getChannels = async (req, res) => {
  const url = `https://api.agora.io/dev/v1/channel/${APP_ID}`;
  console.log("url: ", url);
  const plainCredential = AGORA_API_KEY + ":" + AGORA_API_SECRET;
  const encoded = Buffer.from(plainCredential).toString("base64");

  const data = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Basic ${encoded}`,
      "Content-Type": "application/json",
    },
  });
  const data2 = await data.json();
  console.log("dat:" + data2.success);
  return res.json(data2.data);
};

app.options("*", cors());
app.get("/ping", nocache, ping);
app.get("/rtc/:channel/:role/:tokentype/:uid", nocache, generateRTCToken);
app.get("/rtm/:uid/", nocache, generateRTMToken);
app.get("/rte/:channel/:role/:tokentype/:uid", nocache, generateRTEToken);
app.get(`/channelUsers/:channelName`, nocache, getChannelUsers);
app.get(`/channels`, nocache, getChannels);

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});

app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));
