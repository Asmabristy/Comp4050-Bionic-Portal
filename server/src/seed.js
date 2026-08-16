/**
 * Seeds a demo user and a starter carton catalogue.
 * Run once with: npm run seed
 */
import mongoose from "mongoose";
import { connectDb } from "./db.js";
import { User } from "./models/User.js";
import { Container } from "./models/Container.js";

const CARTONS = [
  { boxId: "SML", label: "Small mailer", w: 240, h: 160, d: 120, maxWeight: 5000 },
  { boxId: "MED", label: "Medium carton", w: 400, h: 300, d: 250, maxWeight: 15000 },
  { boxId: "LRG", label: "Large carton", w: 600, h: 400, d: 400, maxWeight: 25000 },
  { boxId: "PAL", label: "Pallet box", w: 1200, h: 1000, d: 800, maxWeight: 60000 },
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

  for (const carton of CARTONS) {
    const exists = await Container.findOne({ boxId: carton.boxId });
    if (!exists) {
      await Container.create(carton);
      console.log(`[seed] added carton ${carton.boxId}`);
    }
  }

  await mongoose.disconnect();
  console.log("[seed] done");
}

run().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
