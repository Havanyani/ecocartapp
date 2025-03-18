import { useMemo } from 'react';
import type { AnimationConfig } from '@/constants/animation';
import { ANIMATION_PRESETS } from '@/constants/animation';
import type { AnimationFactoryConfig } from '@/utils/animation-factory';
import { createCustomPreset } from '@/utils/animation-presets';

export function useAnimationPreset(
  config: AnimationConfig
): AnimationFactoryConfig {
  return useMemo(() => {
    const preset = ANIMATION_PRESETS[config.preset];
    
    if (!config.options) {
      return preset;
    }

    // Create custom preset with options
    return createCustomPreset(
      config.preset,
      config.options
    );
  }, [config.preset, config.options]);
} 