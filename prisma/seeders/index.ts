
import { seedTechStack } from './techstack.seeder';
import { seedUsers } from './user.seeder';
import { seedProfiles } from './profile.seeder';
import { seedProjects } from './project.seeder';
import { seedExperiences } from './experience.seeder';
import { seedCertifications } from './certification.seeder';
import { seedBlogPosts } from './blogpost.seeder';
import { seedProjectTechStack } from './projecttechstack.seeder';
import { seedExperienceTechStack } from './experiencetechstack.seeder';
import { seedPostTechStack } from './posttechstack.seeder';


async function main() {
    await seedTechStack();
    await seedUsers();
    await seedProfiles();
    await seedProjects();
    await seedExperiences();
    await seedCertifications();
    await seedBlogPosts();
    await seedProjectTechStack();
    await seedExperienceTechStack();
    await seedPostTechStack();
    console.log('All seeds inserted.');
}

main().catch((e) => {
    console.error('Error in seeder:', e);
    process.exit(1);
});
