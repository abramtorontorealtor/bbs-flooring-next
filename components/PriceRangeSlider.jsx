'use client';

import * as React from 'react';
import { Slider } from '@/components/ui/slider';

/**
 * Isolated price range slider.
 *
 * Why its own component: the product grid lives in one big component, so ANY
 * state change there re-renders hundreds of product cards. When the slider's
 * drag lived in that component, every drag tick re-rendered the whole grid,
 * which janked the drag and made Radix lose the pointer (so onValueCommit
 * never fired → no filter applied).
 *
 * Here the live drag value is internal state, so dragging re-renders ONLY this
 * tiny component. The parent grid is untouched until the user releases the
 * thumb, at which point we commit once via onCommit.
 *
 * @param value    committed [lo, hi] numbers
 * @param min/max/step  slider bounds
 * @param onCommit called with [lo, hi] on pointer release / keyboard commit
 */
function PriceRangeSlider({ value, min, max, step = 0.1, onCommit }) {
  const [draft, setDraft] = React.useState(null);
  const shown = draft ?? value;

  return (
    <div className="px-1">
      <Slider
        value={shown}
        onValueChange={setDraft}
        onValueCommit={(val) => { onCommit(val); setDraft(null); }}
        min={min}
        max={max}
        step={step}
        minStepsBetweenThumbs={0}
        className="mb-3"
      />
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600 font-medium tabular-nums">C${(shown[0] ?? min).toFixed(2)}</span>
        <span className="text-slate-400">—</span>
        <span className="text-slate-600 font-medium tabular-nums">C${(shown[1] ?? max).toFixed(2)}</span>
      </div>
    </div>
  );
}

export default React.memo(PriceRangeSlider);
