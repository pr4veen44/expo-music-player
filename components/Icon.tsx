import React from 'react';
import { FontAwesome5 } from '@expo/vector-icons';

type FontAwesomeName = React.ComponentProps<typeof FontAwesome5>['name'];

const FALLBACK_ICON: FontAwesomeName = 'circle';

const ICON_MAP: Record<string, FontAwesomeName> = {
  home: 'home',
  library: 'list-ul',
  search: 'search',
  'person-circle': 'user-circle',
  'musical-note': 'music',
  'musical-notes': 'music',
  'musical-notes-outline': 'music',
  'add': 'plus',
  'add-circle-outline': 'plus-circle',
  heart: 'heart',
  'heart-outline': 'heart',
  'chevron-forward': 'chevron-right',
  'chevron-down': 'chevron-down',
  'chevron-back': 'chevron-left',
  'ellipsis-horizontal': 'ellipsis-h',
  'ellipsis-vertical': 'ellipsis-v',
  'create-outline': 'pencil-alt',
  trash: 'trash',
  'arrow-back': 'arrow-left',
  play: 'play',
  shuffle: 'random',
  repeat: 'redo-alt',
  'play-skip-forward': 'step-forward',
  'play-skip-back': 'step-backward',
  'close-circle': 'times-circle',
  notifications: 'bell',
  moon: 'moon',
};

type IconProps = Omit<React.ComponentProps<typeof FontAwesome5>, 'name'> & {
  name: string;
};

export default function Icon({ name, ...rest }: IconProps) {
  const mapped = ICON_MAP[name] ?? (name as FontAwesomeName) ?? FALLBACK_ICON;
  return <FontAwesome5 name={mapped} solid {...rest} />;
}

