import fs from 'fs';
import os from 'os';
import path from 'path';

import { PrismaClient, MoonPhase, City } from "@prisma/client";
import bcrypt from "bcryptjs"
import csv from 'csv-parser';

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

  await prisma.city.deleteMany({});

  // LOAD MOON PHASE DATA
  const DIR_DATA = path.join(os.homedir(), 'spaces/projects/resdynmed-redux/data');

  const moonPhaseDataPath = path.join(DIR_DATA, 'moonphases');
  const files = fs.readdirSync(moonPhaseDataPath);
  const estimatedPhaseRecords = files.length * 50 * 0.75;

  let moon_count = 0;
  const transactionInserts = [];
  for (const file of files) {
    const filePath = path.join(moonPhaseDataPath, file);

    // each file contains a year's worth of moon phases
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const moonPhasesByYear: MoonPhase[] = JSON.parse(fileContents);
    const relevantPhases = moonPhasesByYear.filter((data) => (
      data.phase === 'NEW' || data.phase === 'FULL' || data.phase === 'LAST'
    ));

    // lump into one large transaction, creating 1 row per transaction is slow (~20/sec)
    for (const data of relevantPhases) {
      transactionInserts.push(prisma.moonPhase.create({
        data: {
          time: data.time,
          phase: data.phase
        },
      }));

      if (moon_count % (Math.floor(estimatedPhaseRecords * 0.1)) === 0) {
        console.log(`${Math.floor(moon_count*100/estimatedPhaseRecords)}% time:${data.time} phase:${data.phase}`, );
      }
      moon_count++;
    }
  }
  try {
    await prisma.$transaction(transactionInserts);
    console.log(`${moon_count} moon phase records seeded`, );
  } catch (error) {
    console.error(error);
  }

  
  // LOAD WORLD CITIES GEOCODE DATA: city name, country code, country name, lat, lon
  const cityEntries: Omit<City, 'id'>[] = [];
  const worldCityDataPath = path.join(DIR_DATA, 'simplemaps/worldcities.csv');

  fs.createReadStream(worldCityDataPath).pipe(csv()).on('data', (row) => {
    cityEntries.push({
      city: row.city,
      cityAscii: row.city_ascii,
      lat: parseFloat(row.lat),
      lon: parseFloat(row.lng),
      countryName: row.country,
      countryCode: row.iso2,
    });
  }).on('end', async () => {
    console.log(`worldcities.csv processed`, );

    const transactionInserts = [];
    let i = 0;
    for (const entry of cityEntries) {
      transactionInserts.push(prisma.city.create({
        data: entry,
      }));
      i++;
    }

    try {
      await prisma.$transaction(transactionInserts);
      console.log(`${i} City geocode records seeded`, );
    } catch (error) {
      console.error(error);
    }
  })

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
