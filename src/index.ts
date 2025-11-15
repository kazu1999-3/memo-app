/**
 * memo-app - Entry Point
 *
 * A simple CLI-based memo application
 */

import { MemoCLI } from './cli.js';

export async function main(): Promise<void> {
  const cli = new MemoCLI();
  await cli.init();

  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'add': {
        const title = args[1];
        const content = args[2];
        const tags = args[3] ? args[3].split(',') : [];

        if (!title || !content) {
          console.log('Error: Title and content are required.');
          console.log('Usage: npm run dev add <title> <content> [tags]');
          process.exit(1);
        }

        const id = await cli.add({ title, content, tags });
        console.log(`✓ Memo created with ID: ${id}`);
        break;
      }

      case 'list': {
        const tagIndex = args.indexOf('--tag');
        const tag = tagIndex !== -1 ? args[tagIndex + 1] : undefined;
        await cli.list({ tag });
        break;
      }

      case 'show': {
        const id = args[1];
        if (!id) {
          console.log('Error: Memo ID is required.');
          console.log('Usage: npm run dev show <id>');
          process.exit(1);
        }
        await cli.show(id);
        break;
      }

      case 'update': {
        const id = args[1];
        if (!id) {
          console.log('Error: Memo ID is required.');
          console.log('Usage: npm run dev update <id> [--title <title>] [--content <content>] [--tags <tags>]');
          process.exit(1);
        }

        const titleIndex = args.indexOf('--title');
        const contentIndex = args.indexOf('--content');
        const tagsIndex = args.indexOf('--tags');

        const updates: { title?: string; content?: string; tags?: string[] } = {};
        if (titleIndex !== -1) updates.title = args[titleIndex + 1];
        if (contentIndex !== -1) updates.content = args[contentIndex + 1];
        if (tagsIndex !== -1) updates.tags = args[tagsIndex + 1].split(',');

        await cli.update(id, updates);
        break;
      }

      case 'delete': {
        const id = args[1];
        if (!id) {
          console.log('Error: Memo ID is required.');
          console.log('Usage: npm run dev delete <id>');
          process.exit(1);
        }
        await cli.delete(id);
        break;
      }

      case 'search': {
        const keyword = args[1];
        if (!keyword) {
          console.log('Error: Search keyword is required.');
          console.log('Usage: npm run dev search <keyword>');
          process.exit(1);
        }
        await cli.search(keyword);
        break;
      }

      case 'help':
      default:
        cli.help();
        break;
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run main if this is the entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}
