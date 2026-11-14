import { createCanvas, loadImage } from '@napi-rs/canvas';
import { CLAN } from '../config/constants.js';

/**
 * Generate an Imperial Welcome Card for new clan members
 */
export async function generateWelcomeCard(member) {
  const width = 1000;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background - Dark Obsidian Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0D0D11');
  bgGrad.addColorStop(0.5, '#151324');
  bgGrad.addColorStop(1, '#09080F');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Background Pattern / Accents
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.08)';
  ctx.lineWidth = 2;
  for (let i = -width; i < width * 2; i += 60) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + height, height);
    ctx.stroke();
  }
  ctx.restore();

  // Outer Imperial Gold Border
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 6;
  ctx.strokeRect(15, 15, width - 30, height - 30);

  // Inner Subtle Border
  ctx.strokeStyle = 'rgba(138, 43, 226, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(25, 25, width - 50, height - 50);

  // Corner Gold Brackets
  drawCornerAccents(ctx, width, height);

  // Load and draw avatar
  const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
  let avatarImg;
  try {
    avatarImg = await loadImage(avatarURL);
  } catch (err) {
    // Fallback if avatar fails to fetch
    avatarImg = null;
  }

  const avatarX = 170;
  const avatarY = 200;
  const avatarRadius = 90;

  // Outer Gold Glow for Avatar
  ctx.save();
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarRadius + 5, 0, Math.PI * 2);
  ctx.fillStyle = '#FFD700';
  ctx.fill();
  ctx.restore();

  // Draw Avatar Image clipped to circle
  if (avatarImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
    ctx.restore();
  }

  // Text: Welcome to Clan Banner
  ctx.textAlign = 'left';
  ctx.fillStyle = '#B8860B';
  ctx.font = 'bold 22px "Segoe UI", sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('AVENTUS EMPIRE • LIFEBOAT SURVIVAL', 320, 140);

  // Text: Welcome Member
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 44px "Segoe UI", sans-serif';
  const name = member.user.username.length > 15 ? member.user.username.substring(0, 15) + '...' : member.user.username;
  ctx.fillText(`WELCOME, ${name.toUpperCase()}!`, 320, 205);

  // Text: Member Count Badge
  const memberCount = member.guild.memberCount;
  ctx.fillStyle = '#00E5FF';
  ctx.font = '600 24px "Segoe UI", sans-serif';
  ctx.fillText(`⚔️ Warrior #${memberCount} of the Empire`, 320, 260);

  // Subtitle / Motto
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = 'italic 18px "Segoe UI", sans-serif';
  ctx.fillText(`"${CLAN.MOTTO}"`, 320, 305);

  return canvas.toBuffer('image/png');
}

/**
 * Generate an Imperial Departure Card
 */
export async function generateLeaveCard(member) {
  const width = 1000;
  const height = 350;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background - Dark Obsidian & Crimson
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0F0909');
  bgGrad.addColorStop(0.5, '#1F1113');
  bgGrad.addColorStop(1, '#080505');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer Border Crimson
  ctx.strokeStyle = '#DC143C';
  ctx.lineWidth = 5;
  ctx.strokeRect(15, 15, width - 30, height - 30);

  // Corner Accents
  drawCornerAccents(ctx, width, height, '#DC143C');

  // Load avatar
  const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
  let avatarImg;
  try {
    avatarImg = await loadImage(avatarURL);
  } catch (err) {
    avatarImg = null;
  }

  const avatarX = 150;
  const avatarY = 175;
  const avatarRadius = 75;

  if (avatarImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
    ctx.restore();
  }

  // Avatar Ring
  ctx.strokeStyle = '#DC143C';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarRadius + 3, 0, Math.PI * 2);
  ctx.stroke();

  // Text
  ctx.textAlign = 'left';
  ctx.fillStyle = '#E74C3C';
  ctx.font = 'bold 20px "Segoe UI", sans-serif';
  ctx.fillText('CLAN LOG • WARRIOR DEPARTURE', 270, 130);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px "Segoe UI", sans-serif';
  const name = member.user.username.length > 18 ? member.user.username.substring(0, 18) + '...' : member.user.username;
  ctx.fillText(`${name.toUpperCase()} HAS LEFT`, 270, 185);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '22px "Segoe UI", sans-serif';
  ctx.fillText(`The Empire stands with ${member.guild.memberCount} remaining warriors.`, 270, 235);

  return canvas.toBuffer('image/png');
}

function drawCornerAccents(ctx, width, height, color = '#FFD700') {
  ctx.save();
  ctx.fillStyle = color;
  const size = 18;
  const offset = 18;

  // Top Left
  ctx.fillRect(offset, offset, size, 4);
  ctx.fillRect(offset, offset, 4, size);

  // Top Right
  ctx.fillRect(width - offset - size, offset, size, 4);
  ctx.fillRect(width - offset - 4, offset, 4, size);

  // Bottom Left
  ctx.fillRect(offset, height - offset - 4, size, 4);
  ctx.fillRect(offset, height - offset - size, 4, size);

  // Bottom Right
  ctx.fillRect(width - offset - size, height - offset - 4, size, 4);
  ctx.fillRect(width - offset - 4, height - offset - size, 4, size);
  ctx.restore();
}
