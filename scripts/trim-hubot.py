"""Trim Hubot Sans (OFL, GitHub) to the axis ranges the site uses: weight 700-800, width 100-116%.

Halves the file the headline waits for (93 KB -> 49 KB for the Latin subset).
Input: the Latin-subset variable woff2 that next/font downloads for Hubot_Sans (axes wdth+wght).
Usage: python scripts/trim-hubot.py <input.woff2>   (needs fonttools + brotli)
"""
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

font = instancer.instantiateVariableFont(TTFont(sys.argv[1]), {"wght": (700, 800), "wdth": (100, 116)})
font.flavor = "woff2"
font.save("src/fonts/hubot-sans-display.woff2")
print("wrote src/fonts/hubot-sans-display.woff2")
