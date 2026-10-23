import { PrismaClient, Role, Technique } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Création des équipes
  const teamA = await prisma.team.upsert({
    where: { id: 'team-a' },
    update: {},
    create: { id: 'team-a', name: 'Équipe Alpha' },
  });

  const teamB = await prisma.team.upsert({
    where: { id: 'team-b' },
    update: {},
    create: { id: 'team-b', name: 'Équipe Beta' },
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  // Managers
  await prisma.user.upsert({
    where: { email: 'manager.alpha@calibre.test' },
    update: {},
    create: {
      email: 'manager.alpha@calibre.test',
      passwordHash,
      role: Role.manager,
      teamId: teamA.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'manager.beta@calibre.test' },
    update: {},
    create: {
      email: 'manager.beta@calibre.test',
      passwordHash,
      role: Role.manager,
      teamId: teamB.id,
    },
  });

  // 6 apprenants par équipe
  for (let i = 1; i <= 6; i++) {
    await prisma.user.upsert({
      where: { email: `learner.a${i}@calibre.test` },
      update: {},
      create: {
        email: `learner.a${i}@calibre.test`,
        passwordHash,
        role: Role.learner,
        teamId: teamA.id,
      },
    });

    await prisma.user.upsert({
      where: { email: `learner.b${i}@calibre.test` },
      update: {},
      create: {
        email: `learner.b${i}@calibre.test`,
        passwordHash,
        role: Role.learner,
        teamId: teamB.id,
      },
    });
  }

  // Initialiser les ratings à 1000 pour tous les apprenants
  const techniques: Technique[] = [
    Technique.none,
    Technique.deformed_statistic,
    Technique.invented_quote,
    Technique.fake_urgency,
    Technique.dubious_source,
    Technique.spoofed_sender,
  ];

  const learners = await prisma.user.findMany({ where: { role: Role.learner } });
  for (const learner of learners) {
    for (const tech of techniques) {
      if (tech === Technique.none) continue;
      await prisma.skillRating.upsert({
        where: { userId_technique: { userId: learner.id, technique: tech } },
        update: {},
        create: {
          userId: learner.id,
          technique: tech,
          rating: 1000,
        },
      });
    }
  }

  console.log('Seed terminé : 2 équipes, 2 managers, 12 apprenants, ratings initialisés');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
