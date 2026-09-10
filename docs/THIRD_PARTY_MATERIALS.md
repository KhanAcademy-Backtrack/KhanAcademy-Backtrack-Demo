# Third-party materials

Khan Academy logo: copied from the rendered public header SVG at https://www.khanacademy.org/ on 10 September 2026. Geometry and aspect ratio are unchanged; its inherited neutral fill is resolved to the observed #151521 for standalone SVG rendering. Used as attribution to the source of learning materials, not as BACKTRACK branding or a partnership lockup.

Official Khan videos remain streamed from their original YouTube privacy-enhanced players, loaded only after a learner presses Watch. No video bytes or full transcripts are redistributed. Each player links to the original Khan lesson. The learning stop includes BACKTRACK-authored concept summaries, worked examples, and guided practice connected to the matched Khan topic. Optional exercise and article links open the originals on Khan Academy. A full Khan page is not used as the learning interface: the repair, practice, and return remain inside BACKTRACK. BACKTRACK-authored practice and examples are labeled as its own fresh checks, not official Khan assessment results.

Usage guidance: https://support.khanacademy.org/hc/en-us/articles/202262954-Can-I-use-Khan-Academy-s-videos-name-materials-links-in-my-project

Video map: see src/lib/khan-materials.ts. Source URLs were inspected in Khan's public rendered page or official channel. Each video open is an activity event only, never a completed exercise or learning result.

Interface font: Plus Jakarta Sans, served through next/font from Google Fonts. Math: STIX Two Text. Existing font/package licensing applies. No generated raster artwork, paid image generation, or copied customer/pilot imagery is used.

## Focused video segments

Four official lessons have caption-verified ranges: factoring D3a8NnpQ2vU at 2:22-3:56, multiplying binomials oOTFGdjhqqM at 1:01-2:51, like terms CLWpkv6ccpA at 1:09-2:16, and distribution Jp25LHI9wII at 0:51-2:19. Continue watching starts at the end of the segment without a stop limit. A learner can also replay the segment or start from the beginning. Other videos retain their full length until their timing is verified.

YouTube documents the start and end parameters here: https://developers.google.com/youtube/player_parameters . The end value is an absolute video timestamp, not a duration.

## Presentation assets

The current deck uses an original abstract street-map background, blue route graphics, and a green BACKTRACK return-route monogram. These are BACKTRACK-authored vectors. The mark draws a lowercase b as a route that turns back toward an earlier step. Its wordmark uses outlined DM Sans Bold. The map is illustrative and does not depict a real campus or Google Maps data. The QR code encodes the professional demo URL in docs/deployment.json.

The UP Manila logo is the institution's original horizontal artwork, unchanged in colour and aspect ratio. Source: https://www.upm.edu.ph/wp-content/themes/University%20of%20the%20Philippines%20Manila/images/home/logo-black.png . The team confirmed UP Manila endorsement and requested the logo on all slides. This does not imply a Khan Academy or Google partnership.

The earlier Paper001 texture by ambientCG / Lennart Demes, CC0, from https://commons.wikimedia.org/wiki/File:Paper001_4K_Color.png remains in underlying imported layers and earlier source assets. It is covered by the current map background.

The current Canva deck uses DM Sans. Its editable PowerPoint backup embeds DM Sans regular and bold using PowerPoint font parts. Editable font permissions are fsType 0. Original TTF files and the OFL license accompany the Drive package.

## Design references

Reviewed the Canva project timeline template at https://www.canva.com/templates/s/timeline/?continuation=750 and the creator’s Canva startup pitch reference at https://morebyus.com/products/animated-startup-pitch-deck-template-canva . The references informed node size, consistent spacing, restrained colour, and clear comparison layouts. No template assets or paid design files were copied into BACKTRACK.

DM Sans font source and license: https://github.com/google/fonts/tree/main/ofl/dmsans . The native Canva export is authoritative; earlier Plus Jakarta Sans exports were superseded.

The GPS route and comparison connectors in the current deck are BACKTRACK-authored SVG graphics. The SVG sources accompany the package; presentation text, cards, and stops remain separate editable Canva elements.
