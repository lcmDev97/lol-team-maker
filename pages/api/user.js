import CryptoJS from "crypto-js";
import { getServerSession } from "next-auth";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { authOptions } from "./auth/[...nextauth]";
import DB from "./utils/db";

dayjs.extend(timezone); // use plugin
dayjs.extend(utc); // use plugin

export default async function handler(req, res) {
  const { method } = req;

  if (method === "POST") {
    const { id, password } = req.body;

    if (!id || !password || id.length > 20 || password.length > 20) {
      return res.json({
        code: 400,
        message: "bad request",
      });
    }

    const db = DB();

    const user = await db("users").where("id", id).first();

    if (user) return res.json({ code: 409, message: "id already in use" });

    const hashedPassword = CryptoJS.algo.HMAC.create(
      CryptoJS.algo.SHA256,
      process.env.HASH_KEY,
    )
      .update(password)
      .finalize()
      .toString(CryptoJS.enc.Hex);

    const inData = {
      id,
      password: hashedPassword,
      created_at: dayjs().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss"),
    };

    await db("users").insert(inData);

    return res.json({
      code: 200,
      message: "ok",
    });
  }

  if (method === "DELETE") {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.json({ code: 401, message: "Expired Session" });
    }

    const db = DB();

    let errorCode;
    try {
      await db("users").where("id", session.user.id).delete();
      await db("friends").where("id", session.user.id).delete();
    } catch (err) {
      errorCode = 400;
    }

    return res.json({
      code: errorCode || 200,
      message: "ok",
    });
  }

  return res.send("Not Allowed Method");
}
