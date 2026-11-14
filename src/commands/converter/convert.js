import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import path from 'path';
import { convertJavaToBedrock } from '../../services/packService.js';
import { downloadFile, cleanupPath, TEMP_DIR } from '../../utils/fileHelper.js';
import { AventusEmbed } from '../../utils/embedBuilder.js';
import { EMOJIS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('convert')
    .setDescription('Port a Minecraft Java texture pack (.zip) or mod (.jar) to Bedrock Edition (.mcpack)')
    .addAttachmentOption(opt =>
      opt.setName('file')
        .setDescription('Upload the Java texture pack (.zip) or Mod (.jar)')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('name')
        .setDescription('Custom name for the Bedrock pack')
        .setRequired(false)
    ),

  async execute(interaction) {
    const attachment = interaction.options.getAttachment('file');
    const customName = interaction.options.getString('name') || attachment.name.replace(/\.[^/.]+$/, '');

    const lowerName = attachment.name.toLowerCase();
    if (!lowerName.endsWith('.zip') && !lowerName.endsWith('.jar')) {
      return await interaction.reply({
        embeds: [AventusEmbed.error('Invalid File Format', 'Please upload a valid Minecraft Java resource pack (`.zip`) or mod (`.jar`).')],
        ephemeral: true
      });
    }

    await interaction.deferReply();

    const tempInputPath = path.join(TEMP_DIR, `input_${Date.now()}_${attachment.name}`);
    let resultMcpack = null;

    try {
      // 1. Download attachment
      await downloadFile(attachment.url, tempInputPath);

      // 2. Convert to Bedrock
      const result = await convertJavaToBedrock(tempInputPath, customName);
      resultMcpack = result.mcpackPath;

      // 3. Prepare response
      const fileAttachment = new AttachmentBuilder(resultMcpack, {
        name: path.basename(resultMcpack)
      });

      const embed = AventusEmbed.imperial(
        'Minecraft Bedrock Pack Conversion Complete',
        `${EMOJIS.CONVERT} Your Java pack has been transformed into a ready-to-import Minecraft Bedrock **.mcpack**!\n\n` +
        `• **Pack Type:** \`${result.stats.packType}\`\n` +
        `• **Textures Remapped:** \`${result.stats.convertedFiles} assets\`\n` +
        `• **Bedrock Manifest UUID:** \`${result.stats.manifestUUID}\`\n` +
        `• **Target Engine:** Bedrock \`1.20+ / Latest\`\n\n` +
        `👉 **How to Install:** Simply download the attached \`.mcpack\` file and open/double-click it. Minecraft Bedrock will launch and import it automatically!`
      );

      await interaction.editReply({ embeds: [embed], files: [fileAttachment] });
    } catch (err) {
      console.error('Pack conversion error:', err);
      await interaction.editReply({
        embeds: [AventusEmbed.error('Conversion Failed', `An error occurred while porting the archive:\n\`${err.message}\``)]
      });
    } finally {
      cleanupPath(tempInputPath);
      if (resultMcpack) {
        // give discord a few seconds before deleting output file
        setTimeout(() => cleanupPath(resultMcpack), 15000);
      }
    }
  }
};
