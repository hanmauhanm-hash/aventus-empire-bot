import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import path from 'path';
import fs from 'fs';
import { recolorImageBuffer, recolorPack } from '../../services/recolorService.js';
import { downloadFile, cleanupPath, TEMP_DIR } from '../../utils/fileHelper.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import { RECOLOR_PRESETS, EMOJIS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('recolor')
    .setDescription('Recolor Minecraft Diamond armor, tools, or full texture packs into custom color themes')
    .addAttachmentOption(opt =>
      opt.setName('file')
        .setDescription('Upload a resource pack (.zip/.mcpack) or an individual texture image (.png)')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('preset')
        .setDescription('Select an imperial color preset')
        .setRequired(false)
        .addChoices(
          { name: '🔴 Ruby / Crimson Blood (#E74C3C)', value: '#E74C3C' },
          { name: '🟣 Amethyst / Void Purple (#9B59B6)', value: '#9B59B6' },
          { name: '🟢 Emerald / Toxic Green (#2ECC71)', value: '#2ECC71' },
          { name: '🌸 Rose Gold / Sakura Pink (#FF69B4)', value: '#FF69B4' },
          { name: '🖤 Midnight Onyx / Obsidian (#222222)', value: '#222222' },
          { name: '❄️ Glacier / Cyan Ice (#00FFFF)', value: '#00FFFF' },
          { name: '☀️ Sunset Gold / Amber (#FFA500)', value: '#FFA500' }
        )
    )
    .addStringOption(opt =>
      opt.setName('custom_hex')
        .setDescription('Provide a custom Hex color code (e.g. #FF1493)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const attachment = interaction.options.getAttachment('file');
    const preset = interaction.options.getString('preset');
    const customHex = interaction.options.getString('custom_hex');

    const targetHex = customHex || preset || '#E74C3C'; // default Ruby

    const lowerName = attachment.name.toLowerCase();
    const isPack = lowerName.endsWith('.zip') || lowerName.endsWith('.mcpack');
    const isImage = lowerName.endsWith('.png');

    if (!isPack && !isImage) {
      return await interaction.reply({
        embeds: [AventusEmbed.error('Invalid Format', 'Please upload a `.zip`, `.mcpack`, or `.png` texture image.')],
        ephemeral: true
      });
    }

    await interaction.deferReply();

    const tempInput = path.join(TEMP_DIR, `recolor_in_${Date.now()}_${attachment.name}`);
    let tempOutput = null;

    try {
      await downloadFile(attachment.url, tempInput);

      if (isPack) {
        // Recolor entire pack
        const result = await recolorPack(tempInput, targetHex, 'diamond');
        tempOutput = result.outputPackPath;

        const fileAttachment = new AttachmentBuilder(tempOutput, {
          name: path.basename(tempOutput)
        });

        const embed = AventusEmbed.imperial(
          'Texture Pack Recolour Complete',
          `${EMOJIS.PALETTE} Successfully recolored **${result.recoloredCount}** diamond armor and tool textures!\n\n` +
          `• **Theme Hex:** \`${targetHex}\`\n` +
          `• **Affected Gear:** Diamond Helmets, Chestplates, Leggings, Boots, Swords, Pickaxes, Axes, Armor Models\n` +
          `• **Format:** Bedrock \`.mcpack\` (Ready to open and import directly!)`
        );

        await interaction.editReply({ embeds: [embed], files: [fileAttachment] });
      } else {
        // Recolor single texture image
        const fileBuf = fs.readFileSync(tempInput);
        const recoloredBuf = await recolorImageBuffer(fileBuf, targetHex, { onlyDiamond: false });

        const fileAttachment = new AttachmentBuilder(recoloredBuf, {
          name: `recolored_${attachment.name}`
        });

        const embed = AventusEmbed.imperial(
          'Single Texture Recolour Complete',
          `${EMOJIS.PALETTE} Successfully shifted the color profile of **${attachment.name}**!\n\n` +
          `• **Target Hex:** \`${targetHex}\`\n` +
          `• Original shading, highlights, and transparency have been preserved.`
        );

        await interaction.editReply({ embeds: [embed], files: [fileAttachment] });
      }
    } catch (err) {
      console.error('Recolor error:', err);
      await interaction.editReply({
        embeds: [AventusEmbed.error('Recoloring Failed', `Failed to recolor texture:\n\`${err.message}\``)]
      });
    } finally {
      cleanupPath(tempInput);
      if (tempOutput) {
        setTimeout(() => cleanupPath(tempOutput), 15000);
      }
    }
  }
};
