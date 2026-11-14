import { EmbedBuilder } from 'discord.js';
import { COLORS, CLAN, EMOJIS } from '../config/constants.js';

export class AventusEmbed extends EmbedBuilder {
  constructor() {
    super();
    this.setColor(COLORS.GOLD);
    this.setFooter({
      text: `${CLAN.NAME} • Lifeboat Survival Mode`,
      iconURL: CLAN.THUMBNAIL_URL
    });
    this.setTimestamp();
  }

  static success(title, description) {
    return new AventusEmbed()
      .setColor(COLORS.SUCCESS)
      .setTitle(`${EMOJIS.CHECK} ${title}`)
      .setDescription(description);
  }

  static error(title, description) {
    return new AventusEmbed()
      .setColor(COLORS.ERROR)
      .setTitle(`${EMOJIS.CROSS} ${title}`)
      .setDescription(description);
  }

  static imperial(title, description) {
    return new AventusEmbed()
      .setColor(COLORS.GOLD)
      .setTitle(`${EMOJIS.CROWN} ${title}`)
      .setDescription(description);
  }

  static owo(title, description) {
    return new AventusEmbed()
      .setColor(COLORS.IMPERIAL_PURPLE)
      .setTitle(`${EMOJIS.SWORD} ${title}`)
      .setDescription(description);
  }

  static ai(title, description) {
    return new AventusEmbed()
      .setColor(COLORS.DIAMOND_CYAN)
      .setTitle(`${EMOJIS.AI_SPARKLE} ${title}`)
      .setDescription(description);
  }
}
