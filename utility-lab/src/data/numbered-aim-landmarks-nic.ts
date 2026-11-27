type AimLandmark = { wide: string; detail: string };

// Cache B Main's crosshairs sit in clear sky. Offsets are measured from the tip
// of the outer roof fin in each publisher's 1920×1080 aim still and rounded to
// whole percentages. They describe the displayed photo, including on 4:3 screens.
function bMainSky(left: number, height: number, direction: "above" | "below"): AimLandmark {
  return {
    wide: "Look between the green crane and the white apartment block. Find the projecting concrete fin at the top of the block’s outside balconies.",
    detail: `The crosshair sits in clear sky, about ${left}% of the aim photo’s width left of the fin tip and ${height}% of its height ${direction} it.`,
  };
}

export const NIC_AIM_LANDMARKS: Readonly<Record<string, AimLandmark>> = {
  "instant-setpos-inferno-86": {
    wide: "Find the white corner stones beside the narrow window on the pink façade.",
    detail: "Use the nearly level seam immediately below the top white block. Center on its left half, beside the wooden eave.",
  },
  "instant-setpos-inferno-21": {
    wide: "Follow the left slope of the pink gable to its projecting stone lip.",
    detail: "Place the center in sky just left of the lip’s exposed end, level with its upper half.",
  },
  "instant-setpos-inferno-108": {
    wide: "Look at the pink gable left of the statue niche, just below the sloping roof trim.",
    detail: "Center along the lower edge of the pale, flaking plaster, to the right of the white corner stones.",
  },
  "precise-setpos-inferno-85": {
    wide: "Use the white stone corner on the left side of the pink building’s narrow window.",
    detail: "Find the diagonal joint that rises to the right. Aim just inside the outer edge of the lower stone, under that joint.",
  },
  "precise-setpos-inferno-82": {
    wide: "Look beneath the wooden balcony roof at the support immediately right of the dark opening.",
    detail: "Use the lower outline of the carved wooden brace, just up and right from its hanging tip.",
  },
  "precise-setpos-inferno-84": {
    wide: "Find where the stone trim of the pink building crosses the wooden balcony roof behind it.",
    detail: "Set the crosshair at the left end of the pale projecting trim, where it meets the darker eave.",
  },
  "precise-setpos-inferno-11": {
    wide: "Find the shaded balcony with the barrel, then look to the opening’s right-hand stone jamb.",
    detail: "Aim at the shadow-side edge of the jamb, just above the short horizontal joint and below the roof beams.",
  },
  "precise-setpos-inferno-10": {
    wide: "Follow the diagonal tiled balcony roof to the pale roof cap visible behind it.",
    detail: "Use the right end of the little horizontal cap, where it turns into a descending slope.",
  },
  "precise-setpos-inferno-83": {
    wide: "Find the narrow cream roof behind the nearer balcony roof, beside the little patch of greenery.",
    detail: "Follow the upper tiled edge down toward the sprig. Aim on the edge immediately left of the leaves.",
  },
  "instant-setpos-nuke-106": {
    wide: "Look up the alley at the sloping guardrail on the distant gray wall. A white lamp pole rises behind it.",
    detail: "Aim on the upper black rail, just to the right of the white pole where they cross.",
  },
  "instant-setpos-nuke-116": {
    wide: "Find the high row of windows on the shaded end wall, above the red truck.",
    detail: "Use the lower-left corner of the end window. The overhead cable meets the wall to its left.",
  },
  "instant-setpos-nuke-75": {
    wide: "Follow the diagonal conduit beneath the high windows on the shaded end wall.",
    detail: "Center on the small pale junction box on that conduit, left of the bright vertical building corner.",
  },
  "instant-setpos-nuke-27": {
    wide: "Find the tall block with rooftop guardrails above the red truck.",
    detail: "Use the vertical boundary between the shaded and sunlit faces, level with the upper end of the high window strip.",
  },
  "instant-setpos-nuke-104": {
    wide: "Look high on the gray wall above the blue door, below the silver rooftop duct.",
    detail: "Follow the pale diagonal conduit to the right of the first blue wall bracket. Center on the conduit itself.",
  },
  "instant-setpos-nuke-172": {
    wide: "Look at the concrete blocks left of the vertical conduit over the blue door.",
    detail: "Use the dark, slightly rising horizontal block joint. It sits between the overhead bracket and the door lamp.",
  },
  "instant-setpos-nuke-136": {
    wide: "Find the rectangular lamp above the blue door and the thin white conduit feeding it.",
    detail: "Center on the gray wall just right of the upright conduit, above its bend and to the left of the lamp.",
  },
  "precise-setpos-nuke-107": {
    wide: "Find the overhead cable crossing the alley above the distant domed roof.",
    detail: "Aim in the sky just above the cable, between the dome fitting on the left and the squat rooftop vent on the right.",
  },
  "precise-setpos-nuke-79": {
    wide: "Use the black cable crossing the alley above the distant white roof.",
    detail: "Center directly on the cable between the top of the dome and the squat vent to its right.",
  },
  "precise-setpos-nuke-80": {
    wide: "Find the black cable over the domed roof, to the left of the building with guardrails.",
    detail: "Keep a small strip of blue between the crosshair and the cable, between the dome fitting and the squat vent.",
  },
  "precise-setpos-nuke-137": {
    wide: "Follow the overhead cable from the domed roof toward the tall building on the right.",
    detail: "Center on the cable between the dome fitting and the wall, a little closer to the wall.",
  },
  "essential-setpos-cache-167": {
    wide: "Look into the recess above the blue snowflake sign, just left of the projecting square panel.",
    detail: "Aim on the brown back wall above the sign, left of the dark diagonal support inside the recess.",
  },
  "essential-setpos-cache-135": {
    wide: "Find the projecting square panel beside the blue snowflake sign.",
    detail: "Center just inside the panel’s upper-left corner, immediately below the thin top rim.",
  },
  "instant-setpos-cache-123": {
    wide: "Face the red rooftop lettering across the yard. Find the end of the long middle word, ОСТОРОЖНЫ.",
    detail: "Set the crosshair roughly half a letter-height above the final Ы, just left of the separated С.",
  },
  "instant-setpos-cache-88": {
    wide: "Find the single red С between the two longer words on the rooftop sign.",
    detail: "Aim above the left half of the С, leaving roughly half a letter-height of sky above it.",
  },
  "instant-setpos-cache-87": {
    wide: "Look above the blue trailer at the last word on the red roof sign, ОГНЕМ.",
    detail: "Center about half a letter-height above the left edge of Г, the letter just after О.",
  },
  "instant-setpos-cache-100": {
    wide: "Find the first word, БУДЬТЕ, on the red rooftop sign across the yard.",
    detail: "Aim in the sky above the gap before Т, about two letter-heights above the tops of the letters.",
  },
  "instant-setpos-cache-99": {
    wide: "Use the right half of the red rooftop sign’s first word, БУДЬТЕ.",
    detail: "Sight just left of Т and raise the center about three letter-heights above the top of the word.",
  },
  "instant-setpos-cache-98": {
    wide: "Find the first О of the long middle word, ОСТОРОЖНЫ, on the red rooftop sign.",
    detail: "Aim over the left half of that О, a little more than two letter-heights above it.",
  },
  "instant-setpos-cache-124": {
    wide: "Use the gap between the first two words of the red rooftop sign.",
    detail: "Sight up from the left edge of the first О in ОСТОРОЖНЫ. Leave roughly two and a half letter-heights of sky.",
  },
  "instant-setpos-cache-90": {
    wide: "Read along the middle word on the rooftop sign to the second О in ОСТОРОЖНЫ.",
    detail: "Aim above the left edge of that second О, about two letter-heights above its top.",
  },
  "instant-setpos-cache-89": {
    wide: "Use the first three letters of ОСТОРОЖНЫ on the rooftop.",
    detail: "Align over the vertical stroke of Т, roughly three letter-heights above its crossbar.",
  },
  "instant-setpos-cache-126": {
    wide: "Look over the blue trailer at the middle word on the red sign.",
    detail: "Line up with Р in ОСТОРОЖНЫ. The crosshair sits high in clear sky, roughly six letter-heights above it.",
  },
  "instant-setpos-cache-121": {
    wide: "Use the rounded roof of the blue trailer in front of the red sign.",
    detail: "Sight over the left quarter of the curved roof. Leave about 4% of the aim photo’s height between the roof and the crosshair.",
  },
  "precise-setpos-cache-128": bMainSky(27, 4, "below"),
  "precise-setpos-cache-166": bMainSky(23, 9, "below"),
  "precise-setpos-cache-20": bMainSky(26, 2, "below"),
  "precise-setpos-cache-129": bMainSky(24, 4, "above"),
  "precise-setpos-cache-125": bMainSky(26, 8, "below"),
  "precise-setpos-cache-19": bMainSky(25, 4, "below"),
  "precise-setpos-cache-127": bMainSky(23, 1, "above"),
  "precise-setpos-cache-18": bMainSky(26, 21, "below"),
  "precise-setpos-cache-122": bMainSky(23, 9, "below"),
  "precise-setpos-cache-17": bMainSky(22, 3, "below"),
  "expanded-csnades-cache-smoke-garage-from-ct-spawn-1": {
    wide: "Look up at the ceiling grid. Find the isolated dark square above the green railing.",
    detail: "Use the middle of the square’s top edge, on the horizontal frame between the dark opening and the pale panel.",
  },
  "expanded-csnades-cache-smoke-garage-from-ct-spawn-2": {
    wide: "Find the vertical seam between panels above the broad, peeling beam.",
    detail: "Trace the seam down to the small dark fleck halfway up the face of the beam.",
  },
  "expanded-csnades-cache-smoke-garage-from-ct-spawn-3": {
    wide: "Find two adjacent dark ceiling panels with two pale panels just below.",
    detail: "Center at the four-way intersection, where the horizontal frame meets the divider between the dark pair.",
  },
  "expanded-csnades-cache-smoke-garage-from-ct-spawn-4": {
    wide: "Look at the broad horizontal beam below the green railing and the patch of broken plaster.",
    detail: "Follow the narrow vertical smudge up the face of the beam to its upper horizontal seam.",
  },
};
