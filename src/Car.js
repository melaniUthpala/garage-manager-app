import { useEffect, useRef } from 'react';
import { Animated, Image } from 'react-native';
import Svg, {
  Defs, LinearGradient, RadialGradient, Stop, Path, Rect, Ellipse, Circle, G, Mask, Text as SvgText,
} from 'react-native-svg';
import { CAR_PHOTO } from './carImage';

// Hero car for the Home screen. Uses the SVG sports car below, or your own
// photo when CAR_PHOTO is set in src/carImage.js. Floats gently up and down.
export default function CarHero({ plate = 'GARAGE', width }) {
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(y, { toValue: -6, duration: 2200, useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 2200, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  const height = width * 0.725;
  const fs = String(plate).length > 8 ? 8 : 10;

  return (
    <Animated.View style={{ width, height, transform: [{ translateY: y }] }}>
      {CAR_PHOTO ? (
        <>
          <Image source={CAR_PHOTO} resizeMode="contain" style={{ width, height: height * 0.72 }} />
          <Image source={CAR_PHOTO} resizeMode="contain"
            style={{ width, height: height * 0.72, opacity: 0.14, transform: [{ scaleY: -1 }], marginTop: -4 }} />
        </>
      ) : (
        <Svg width={width} height={height} viewBox="0 0 400 290">
<Defs>
<LinearGradient id="paint" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#9AF7E9"/><Stop offset="0.35" stopColor="#36E6C0"/><Stop offset="0.7" stopColor="#16A9A8"/><Stop offset="1" stopColor="#0B4D57"/></LinearGradient>
<LinearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#0A141A"/><Stop offset="1" stopColor="#27495A"/></LinearGradient>
<LinearGradient id="light" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#9CF3FF"/><Stop offset="1" stopColor="#FFFFFF"/></LinearGradient>
<RadialGradient id="halo" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor="#20D8E8" stopOpacity="0.42"/><Stop offset="1" stopColor="#20D8E8" stopOpacity="0"/></RadialGradient>
<RadialGradient id="under" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor="#35E89A" stopOpacity="0.75"/><Stop offset="1" stopColor="#35E89A" stopOpacity="0"/></RadialGradient>
<LinearGradient id="fadeG" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#FFFFFF"/><Stop offset="1" stopColor="#000000"/></LinearGradient>
<Mask id="fade" x="0" y="190" width="400" height="100" maskUnits="userSpaceOnUse"><Rect x="0" y="190" width="400" height="100" fill="url(#fadeG)"/></Mask>
</Defs>
<Ellipse cx="200" cy="120" rx="215" ry="125" fill="url(#halo)"/>
<Ellipse cx="200" cy="194" rx="196" ry="26" fill="url(#under)"/>
<Ellipse cx="200" cy="192" rx="150" ry="10" fill="#35E89A" fillOpacity="0.35"/>
<G mask="url(#fade)" opacity="0.38"><G transform="translate(0,380) scale(1,-1)"><G>
<Rect x="46" y="124" width="40" height="66" rx="12" fill="#0b0d0f"/>
<Rect x="46" y="124" width="40" height="66" rx="12" fill="none" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.5"/>
<Path d="M54 134 L54 182" stroke="#20D8E8" strokeOpacity="0.35" strokeWidth="2"/><G transform="translate(400,0) scale(-1,1)"><Rect x="46" y="124" width="40" height="66" rx="12" fill="#0b0d0f"/>
<Rect x="46" y="124" width="40" height="66" rx="12" fill="none" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.5"/>
<Path d="M54 134 L54 182" stroke="#20D8E8" strokeOpacity="0.35" strokeWidth="2"/></G>
<Path d="M52 152 C52 130 72 114 102 106 L142 72 C154 62 176 58 200 58 C224 58 246 62 258 72 L298 106 C328 114 348 130 348 152 L348 178 C348 185 343 189 336 189 L64 189 C57 189 52 185 52 178 Z" fill="url(#paint)"/>
<Path d="M118 104 L282 104 C312 112 330 124 334 140 L66 140 C70 124 88 112 118 104 Z" fill="#ffffff" fillOpacity="0.10"/>
<Path d="M106 106 L142 72 C154 63 176 59 200 59 C224 59 246 63 258 72 L294 106 C262 98 138 98 106 106 Z" fill="#ffffff" fillOpacity="0.16"/>
<Path d="M150 76 C164 67 236 67 250 76 L280 103 L120 103 Z" fill="url(#glass)"/>
<Path d="M162 78 L192 78 L152 101 L130 101 Z" fill="#ffffff" fillOpacity="0.12"/>
<Path d="M146 74 C160 63 240 63 254 74" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="2" fill="none"/>
<Path d="M98 104 L82 99 L86 111 L102 111 Z" fill="#0d2a30"/>
<Path d="M66 130 C84 121 112 115 136 115 L142 125 C118 129 92 137 72 146 Z" fill="url(#light)"/>
<Path d="M76 134 C96 127 118 122 136 120" stroke="#20D8E8" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
<Path d="M56 150 C60 134 76 122 104 110 L142 73" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.6" fill="none"/>
<Path d="M72 154 L118 154 L110 176 L74 176 Z" fill="#071014"/>
<Path d="M80 160 L112 160 M78 167 L110 167" stroke="#20D8E8" strokeOpacity="0.35" strokeWidth="1.4"/><G transform="translate(400,0) scale(-1,1)"><Path d="M98 104 L82 99 L86 111 L102 111 Z" fill="#0d2a30"/>
<Path d="M66 130 C84 121 112 115 136 115 L142 125 C118 129 92 137 72 146 Z" fill="url(#light)"/>
<Path d="M76 134 C96 127 118 122 136 120" stroke="#20D8E8" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
<Path d="M56 150 C60 134 76 122 104 110 L142 73" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.6" fill="none"/>
<Path d="M72 154 L118 154 L110 176 L74 176 Z" fill="#071014"/>
<Path d="M80 160 L112 160 M78 167 L110 167" stroke="#20D8E8" strokeOpacity="0.35" strokeWidth="1.4"/></G>
<Path d="M200 104 L200 138 M172 104 L186 138 M228 104 L214 138" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.4"/>
<Path d="M128 150 L272 150 L286 177 L114 177 Z" fill="#071014"/>
<Path d="M134 158 L266 158 M130 166 L270 166" stroke="#20D8E8" strokeOpacity="0.3" strokeWidth="1.5"/>
<Circle cx="200" cy="136" r="6" fill="#0b1c22" stroke="#20D8E8" strokeWidth="1.6"/>
<Path d="M60 184 L340 184" stroke="#20D8E8" strokeOpacity="0.75" strokeWidth="2.6" strokeLinecap="round"/>
<Path d="M64 190 L336 190" stroke="#001014" strokeOpacity="0.7" strokeWidth="3"/>

</G></G></G>
<G>
<Rect x="46" y="124" width="40" height="66" rx="12" fill="#0b0d0f"/>
<Rect x="46" y="124" width="40" height="66" rx="12" fill="none" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.5"/>
<Path d="M54 134 L54 182" stroke="#20D8E8" strokeOpacity="0.35" strokeWidth="2"/><G transform="translate(400,0) scale(-1,1)"><Rect x="46" y="124" width="40" height="66" rx="12" fill="#0b0d0f"/>
<Rect x="46" y="124" width="40" height="66" rx="12" fill="none" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.5"/>
<Path d="M54 134 L54 182" stroke="#20D8E8" strokeOpacity="0.35" strokeWidth="2"/></G>
<Path d="M52 152 C52 130 72 114 102 106 L142 72 C154 62 176 58 200 58 C224 58 246 62 258 72 L298 106 C328 114 348 130 348 152 L348 178 C348 185 343 189 336 189 L64 189 C57 189 52 185 52 178 Z" fill="url(#paint)"/>
<Path d="M118 104 L282 104 C312 112 330 124 334 140 L66 140 C70 124 88 112 118 104 Z" fill="#ffffff" fillOpacity="0.10"/>
<Path d="M106 106 L142 72 C154 63 176 59 200 59 C224 59 246 63 258 72 L294 106 C262 98 138 98 106 106 Z" fill="#ffffff" fillOpacity="0.16"/>
<Path d="M150 76 C164 67 236 67 250 76 L280 103 L120 103 Z" fill="url(#glass)"/>
<Path d="M162 78 L192 78 L152 101 L130 101 Z" fill="#ffffff" fillOpacity="0.12"/>
<Path d="M146 74 C160 63 240 63 254 74" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="2" fill="none"/>
<Path d="M98 104 L82 99 L86 111 L102 111 Z" fill="#0d2a30"/>
<Path d="M66 130 C84 121 112 115 136 115 L142 125 C118 129 92 137 72 146 Z" fill="url(#light)"/>
<Path d="M76 134 C96 127 118 122 136 120" stroke="#20D8E8" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
<Path d="M56 150 C60 134 76 122 104 110 L142 73" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.6" fill="none"/>
<Path d="M72 154 L118 154 L110 176 L74 176 Z" fill="#071014"/>
<Path d="M80 160 L112 160 M78 167 L110 167" stroke="#20D8E8" strokeOpacity="0.35" strokeWidth="1.4"/><G transform="translate(400,0) scale(-1,1)"><Path d="M98 104 L82 99 L86 111 L102 111 Z" fill="#0d2a30"/>
<Path d="M66 130 C84 121 112 115 136 115 L142 125 C118 129 92 137 72 146 Z" fill="url(#light)"/>
<Path d="M76 134 C96 127 118 122 136 120" stroke="#20D8E8" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
<Path d="M56 150 C60 134 76 122 104 110 L142 73" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.6" fill="none"/>
<Path d="M72 154 L118 154 L110 176 L74 176 Z" fill="#071014"/>
<Path d="M80 160 L112 160 M78 167 L110 167" stroke="#20D8E8" strokeOpacity="0.35" strokeWidth="1.4"/></G>
<Path d="M200 104 L200 138 M172 104 L186 138 M228 104 L214 138" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.4"/>
<Path d="M128 150 L272 150 L286 177 L114 177 Z" fill="#071014"/>
<Path d="M134 158 L266 158 M130 166 L270 166" stroke="#20D8E8" strokeOpacity="0.3" strokeWidth="1.5"/>
<Circle cx="200" cy="136" r="6" fill="#0b1c22" stroke="#20D8E8" strokeWidth="1.6"/>
<Path d="M60 184 L340 184" stroke="#20D8E8" strokeOpacity="0.75" strokeWidth="2.6" strokeLinecap="round"/>
<Path d="M64 190 L336 190" stroke="#001014" strokeOpacity="0.7" strokeWidth="3"/>
<Rect x="170" y="159" width="60" height="17" rx="3" fill="#F4F7F8"/>
<SvgText x="200" y="171.5" fontSize={fs} fontWeight="bold" textAnchor="middle" fill="#111418">{plate}</SvgText>
</G>
<Circle cx="64" cy="170" r="1.6" fill="#fff" fillOpacity="0.8"/><Circle cx="48" cy="150" r="1.2" fill="#fff" fillOpacity="0.6"/>
<Circle cx="338" cy="168" r="1.6" fill="#fff" fillOpacity="0.8"/><Circle cx="356" cy="144" r="1.2" fill="#fff" fillOpacity="0.6"/>
<Circle cx="86" cy="196" r="1.4" fill="#fff" fillOpacity="0.5"/><Circle cx="318" cy="198" r="1.4" fill="#fff" fillOpacity="0.5"/>
        </Svg>
      )}
    </Animated.View>
  );
}
