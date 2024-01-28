import fs from 'fs';
import os from 'os';
import path from 'path';

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";


const prisma = new PrismaClient();

async function createUser(email: string) {
  const hashedPassword = await bcrypt.hash("foo", 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  return user;
}
async function seed() {
  const email = "rachel@remix.run";

  // CLEANUP THE EXISTING DATABASE
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  await prisma.moonPhase.deleteMany({});

  const srcDatPath = path.join(os.homedir(), 'spaces/projects/resdynmed-redux/srcdat/moonphases');
  const files = fs.readdirSync(srcDatPath);

  let i = 0;
  const transactionInserts = [];
  for (const file of files) {
    const filePath = path.join(srcDatPath, file);

    // each file contains a year's worth of moon phases
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const moonPhasesByYear = JSON.parse(fileContents);

    // lump into one large transaction, creating 1 row per transaction is slow (~20/sec)
    for (const data of moonPhasesByYear) {
      transactionInserts.push(prisma.moonPhase.create({
        data: {
          time: data.time,
          phase: data.phase
        },
      }));

      if (i % 2000 === 0) {
        console.log(`${i*100/20000}% time:${data.time} phase:${data.phase}`, );
      }
      i++;
    }
  }
  await prisma.$transaction(transactionInserts);

  console.log(`${i} moon phase records seeded`, );
  

  const user = await createUser(email);

  await prisma.note.create({
    data: {
      title: "My first note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "My second note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
