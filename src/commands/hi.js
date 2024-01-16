const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hi')
		.setDescription('Replies with hi'),
	debug: true,
	async execute(interaction) {
		await interaction.reply('hi');
	},
};
