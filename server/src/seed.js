/**
 * Seeds demo accounts and a starter carton catalogue into Supabase.
 * Run once with: npm run seed
 *
 * Safe to re-run: existing accounts have their password and role reset to the
 * values below, and cartons are matched on reference rather than wiped.
 */
import { supabase, connectDb } from "./supabase.js";
import * as containers from "./data/containers.js";

const ACCOUNTS = [
  {
    email: "supervisor@thomax.com",
    password: "Demo@1234",
    name: "Demo Supervisor",
    role: "supervisor",
  },
  {
    email: "operator@thomax.test",
    password: "perfectfit",
    name: "Demo Operator",
    role: "operator",
  },
];

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
    maximumBoxes: null,
  },
  {
    reference: "LRG",
    width: 1200,
    length: 1200,
    depth: 1200,
    maxWeight: null,
    boxWeight: null,
    active: false,
    maximumBoxes: null,
  },
];

/** Supabase has no "find user by email", so page through the admin list. */
async function findAuthUserByEmail(email) {
  let page = 1;

  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) throw new Error(`Could not list users: ${error.message}`);

    const match = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (match) return match;

    if (data.users.length < 200) return null;
    page += 1;
  }
}

async function seedAccount({ email, password, name, role }) {
  let user = await findAuthUserByEmail(email);

  if (user) {
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (error) throw new Error(`Could not update ${email}: ${error.message}`);
    console.log(`[seed] updated ${email} / ${password}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (error) throw new Error(`Could not create ${email}: ${error.message}`);
    user = data.user;
    console.log(`[seed] created ${email} / ${password}`);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: user.id, email, name, role }, { onConflict: "id" });

  if (profileError) {
    throw new Error(`Could not save profile for ${email}: ${profileError.message}`);
  }

  console.log(`[seed]   role: ${role}`);
}

async function seedCarton(carton) {
  const existing = await containers.findByReference(carton.reference);

  if (existing) {
    await containers.update(existing.id, carton);
    console.log(`[seed] updated carton ${carton.reference}`);
  } else {
    await containers.create(carton);
    console.log(`[seed] added carton ${carton.reference}`);
  }
}

async function run() {
  await connectDb();

  for (const account of ACCOUNTS) {
    await seedAccount(account);
  }

  for (const carton of CARTONS) {
    await seedCarton(carton);
  }

  console.log("[seed] done");
}

run().catch((err) => {
  console.error("[seed] failed:", err.message);
  process.exit(1);
});
