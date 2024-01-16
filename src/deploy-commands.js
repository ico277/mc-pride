require('dotenv').config()
const { REST, Routes } = require('discord.js');
const { CLIENTID: client_id, TOKEN} = process.env;
const { debug_guild: guild_id  } = require("../config/cfg.json");
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const commands_debug = [];
const commands_folder_path = path.join(__dirname, 'commands');
const commands_files = fs.readdirSync(commands_folder_path).filter(f => f.endsWith(".js"));
for (const file of commands_files) {
    const filePath = path.join(commands_folder_path, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command && 'debug' in command) {
        (command.debug ? commands_debug : commands).push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(TOKEN);

// and deploy your commands!
(async () => {
    try {
        console.log(`Started refreshing ${commands.length + commands_debug.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        let data = await rest.put(
            Routes.applicationGuildCommands(client_id, guild_id),
            { body: commands_debug },
        );
        console.log(`Successfully reloaded ${data.length} application (/) commands into ${guild_id}.`);
        
        data = await rest.put(
			Routes.applicationCommands(client_id),
			{ body: commands },
		);
        console.log(`Successfully reloaded ${data.length} application (/) commands globally.`);

        console.log(`Done refreshing (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();
