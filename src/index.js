require('dotenv').config()
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { TOKEN } = process.env;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Load commands
console.log("Loading commands...");
const commands_folder_path = path.join(__dirname, 'commands');
const commands_files = fs.readdirSync(commands_folder_path).filter(f => f.endsWith(".js"));
for (const file of commands_files) {
	const file_path = path.join(commands_folder_path, file);
	const command = require(file_path);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
		console.log("> loaded '%s'!", file)
		if ('global' in command) {
			console.log("> global: '%s'!", command.global)
		}
		if ('guild' in command) {
			console.log("> guild: '%s'!", command.guild)
		}
	} else {
		console.log(`[WARNING] The command at ${file_path} is missing a required "data" or "execute" property.`);
	}
}
console.log("Done loading commands.");

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching '${interaction.commandName}' was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Log in to Discord with your client's TOKEN
client.login(TOKEN);
