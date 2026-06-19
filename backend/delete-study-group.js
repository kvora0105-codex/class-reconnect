import mongoose from 'mongoose';
import 'dotenv/config';
import StudyGroup from './src/models/StudyGroup.js';
import GroupMember from './src/models/GroupMember.js';
import GroupMessage from './src/models/GroupMessage.js';

const groupNamesToDelete = ['SY DS STUDY GRP', 'SY MATHS STUDY GRP'];

async function deleteStudyGroups() {
    try {
        console.log(`Connecting to MongoDB...`);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        let totalMembersDeleted = 0;
        let totalMessagesDeleted = 0;
        let groupsDeleted = 0;

        for (const groupName of groupNamesToDelete) {
            // Find the study group by name
            const group = await StudyGroup.findOne({ name: groupName });
            
            if (!group) {
                console.log(`❌ Study group "${groupName}" not found.`);
                continue;
            }

            console.log(`✓ Found study group: ${group.name} (ID: ${group._id})`);
            console.log('  Deleting associated data...');

            // Delete all members in the group
            const membersDel = await GroupMember.deleteMany({ groupId: group._id });
            console.log(`    - Deleted ${membersDel.deletedCount} group members`);
            totalMembersDeleted += membersDel.deletedCount;

            // Delete all messages in the group
            const messagesDel = await GroupMessage.deleteMany({ groupId: group._id });
            console.log(`    - Deleted ${messagesDel.deletedCount} group messages`);
            totalMessagesDeleted += messagesDel.deletedCount;

            // Delete the study group itself
            const groupDel = await StudyGroup.deleteOne({ _id: group._id });
            console.log(`    - Deleted study group\n`);
            groupsDeleted += 1;
        }

        console.log(`\n=== SUMMARY ===`);
        console.log(`Study groups deleted: ${groupsDeleted}`);
        console.log(`Total group members deleted: ${totalMembersDeleted}`);
        console.log(`Total group messages deleted: ${totalMessagesDeleted}`);
        
        if (groupsDeleted === groupNamesToDelete.length) {
            console.log(`\n✓ All study groups have been successfully deleted!`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error deleting study groups:', error);
        process.exit(1);
    }
}

deleteStudyGroups();
