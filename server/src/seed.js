/**
 * Seeds a demo user and a starter carton catalogue.
 * Run once with: npm run seed
 */
import mongoose from "mongoose";
import { connectDb } from "./db.js";
import { User } from "./models/User.js";
import { Container } from "./models/Container.js";

const CARTONS = [
  {
    reference: "SML",
    width: 150,
    length: 150,
    depth: 150,
    maxWeight: 8.5,
    boxWeight: 0.5,
    active: true,
    maximumBoxes: 100,
  },
  {
    reference: "MED",
    width: 400,
    length: 400,
    depth: 400,
    maxWeight: 15.2,
    boxWeight: 0.75,
    active: true,
  },
  {
    reference: "LRG",
    width: 1200,
    length: 1200,
    depth: 1200,
    active: false,
  },
];
async function run() {
  await connectDb();

  const email = "operator@thomax.test";
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      name: "Demo Operator",
      passwordHash: await User.hashPassword("perfectfit"),
      role: "admin",
    });
    console.log(`[seed] created user ${email} / perfectfit`);
  } else {
    console.log(`[seed] user ${email} already exists`);
  }
await Container.deleteMany({});
console.log("[seed] cleared existing cartons");
  for (const carton of CARTONS) {
  const exists = await Container.findOne({
    reference: carton.reference,
  });

  if (!exists) {
    await Container.create(carton);
    console.log(
      `[seed] added carton ${carton.reference}`
    );
  }
}

  await mongoose.disconnect();
  console.log("[seed] done");
}

run().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
