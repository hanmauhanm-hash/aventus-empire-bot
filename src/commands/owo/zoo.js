import { SlashCommandBuilder } from 'discord.js';
import { getUserZoo, getUserProfile } from '../../services/owoService.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import { EMOJIS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('zoo')
    .setDescription('Inspect your imperial menagerie of captured beasts and mobs')
    .addUserOption(opt =>
      opt.setName('member')
        .setDescription('User whose zoo you want to view')
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('member') || interaction.user;
    const zoo = getUserZoo(target.id);
    const profile = getUserProfile(target.id);

    if (zoo.length === 0) {
      const emptyEmbed = AventusEmbed.owo(
        `${target.username}'s Imperial Zoo`,
        `${target.username} has not captured any survival beasts yet!\nUse \`/hunt\` to embark on an expedition into the wilderness.`
      );
      return await interaction.reply({ embeds: [emptyEmbed] });
    }

    const totalBeasts = zoo.reduce((acc, b) => acc + b.count, 0);
    const totalPower = zoo.reduce((acc, b) => acc + b.attack * b.count, 0);

    const beastList = zoo.map(b => {
      return `• **${b.name}** [x${b.count}] — \`${b.rarity}\` | ⚔️ \`${b.attack} ATK\` | ❤️ \`${b.hp} HP\``;
    }).slice(0, 15).join('\n');

    const embed = AventusEmbed.owo(
      `${EMOJIS.CROWN} ${target.username}'s Imperial Menagerie`,
      `**Clan Rank Level:** \`${profile.level}\` | **Total Hunts:** \`${profile.hunt_count}\`\n` +
      `**Total Beasts:** \`${totalBeasts}\` | **Squad Combat Power:** \`${totalPower}\`\n\n` +
      `### Captured Beasts:\n${beastList}${zoo.length > 15 ? `\n*...and ${zoo.length - 15} more in the clan vaults.*` : ''}`
    );

    await interaction.reply({ embeds: [embed] });
  }
};
