// ThemeThumbnail.jsx — theme ka chhota card: API ke preview (background + decorations) se, card wale hi drawing se.
import React, { useId } from 'react';
import { Decorations, SideBackground } from '../../idCards/IdCardSide.jsx';

/**
 * @param {object} props
 * @param {{ preview: { width: number, height: number, background: object, decorations: object[] }, colors: object }} props.theme
 */
export const ThemeThumbnail = ({ theme }) => {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const preview = theme.preview;
  if (!preview) return null;
  const { width: W, height: H } = preview;
  const lineH = Math.min(W, H) * 0.03;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full rounded-md ring-1 ring-slate-200" aria-hidden="true">
      <SideBackground background={preview.background} W={W} H={H} uid={uid} />
      <Decorations shapes={preview.decorations} uid={uid} />
      {/* Naam + class ki jagah: rang dikhane ke liye */}
      <rect x={W * 0.25} y={H * 0.5} width={W * 0.5} height={lineH} rx={lineH / 2} fill={theme.colors?.text} />
      <rect x={W * 0.32} y={H * 0.5 + lineH * 2} width={W * 0.36} height={lineH * 0.8} rx={lineH / 2} fill={theme.colors?.mutedText} opacity={0.75} />
    </svg>
  );
};

export default ThemeThumbnail;
