import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import { EMOJIS, CLAN } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Explore all Aventus Empire commands and clan features'),

  async execute(interaction) {
    const embed = AventusEmbed.imperial(
      `${CLAN.NAME} — Command Codex`,
      `Welcome to the command hub for the **${CLAN.NAME}** on Lifeboat Survival Mode (Bedrock).\nSelect a module below or browse the categories.`
    )
    .addFields(
      {
        name: `${EMOJIS.CROWN} Imperial Welcome & Leave`,
        value: '`/config-welcome`, `/config-leave`, `/test-welcome`'
      },
      {
        name: `${EMOJIS.SWORD} OwO-Style RPG & Mini-Game`,
        value: '`/hunt`, `/zoo`, `/battle`, `/daily`, `/coinflip`, `/slots`, `/trade`, `/leaderboard`'
      },
      {
        name: `${EMOJIS.AI_SPARKLE} Puter.js AI Imperial Advisor`,
        value: '`/ask` — Strategic Lifeboat Bedrock intelligence'
      },
      {
        name: `${EMOJIS.CONVERT} Java to Bedrock Converter`,
        value: '`/convert` — Port Java texturepacks & mods to Bedrock `.mcpack`'
      },
      {
        name: `${EMOJIS.PALETTE} Texturepack Recolour Engine`,
        value: '`/recolor` — Color diamond gear & tools (Ruby, Amethyst, Emerald, Onyx, Hex)'
      },
      {
        name: `${EMOJIS.SHIELD} Clan & Lifeboat Survival Tools`,
        value: '`/coords`, `/lbsg`, `/raid`, `/tax`'
      }
    );

    await interaction.reply({ embeds: [embed] });
  }
};
