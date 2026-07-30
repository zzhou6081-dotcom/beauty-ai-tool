import type { Step1Style, Step3Style } from './types'

// All prompts use Flux Kontext (img2img editing)
// Key: keep the face identical, only transform the specified area

export const STEP1_PROMPTS: Record<Step1Style, string> = {
  parallel:
    'Edit only the eyelids. Keep the person\'s face, skin, hair, and all other features completely unchanged. ' +
    'Create a parallel double eyelid (平行双眼皮): the crease runs parallel to the upper eyelid edge at medium height, ' +
    'creating a symmetric, even fold visible from inner to outer corner. ' +
    'Simulate fresh post-surgery appearance: mild swelling along the eyelid, slight redness at the crease line, ' +
    'thin sutures barely visible. Close-up portrait, soft medical lighting, photorealistic.',

  fan:
    'Edit only the eyelids. Keep the person\'s face, skin, hair, and all other features completely unchanged. ' +
    'Create a fan-shaped double eyelid (扇形双眼皮): crease is narrow at the inner corner and gradually widens toward the outer corner, ' +
    'the most natural-looking Asian double eyelid style. ' +
    'Simulate fresh post-surgery appearance: mild natural swelling, slight redness, sutures at crease. ' +
    'Close-up portrait, soft medical lighting, photorealistic.',

  open_fan:
    'Edit only the eyelids. Keep the person\'s face, skin, hair, and all other features completely unchanged. ' +
    'Create an open fan double eyelid (开扇形双眼皮): the crease is visible from the inner corner with the inner canthus slightly open, ' +
    'wider than a standard fan shape, giving a more open inner-corner look. ' +
    'Fresh post-surgery: natural swelling, sutures visible at crease line. ' +
    'Close-up portrait, soft medical lighting, photorealistic.',

  wide:
    'Edit only the eyelids. Keep the person\'s face, skin, hair, and all other features completely unchanged. ' +
    'Create a wide/high double eyelid (宽双眼皮): the crease is set at a high position, creating a dramatic eye-enlarging effect, ' +
    'bold and striking appearance. ' +
    'Fresh post-surgery: visible periorbital swelling and bruising, sutures clearly visible along high crease. ' +
    'Close-up portrait, soft medical lighting, photorealistic.',
}

export const STEP2_PROMPT =
  'Keep this person\'s face, double eyelid, and post-surgery appearance exactly the same. ' +
  'Change only the camera angle to a natural three-quarter view (slightly turned face). ' +
  'Same lighting style, same environment. Portrait photography, photorealistic. ' +
  'Do not alter the eyelids, swelling, or any facial feature.'

export const STEP3_PROMPTS: Record<Step3Style, string> = {
  standard:
    'Edit only the eyelids. Keep the person\'s face, skin, hair, and all other features completely unchanged. ' +
    'Transform the eyelids to standard single eyelid (标准单眼皮): ' +
    'no visible crease, completely flat upper eyelid, classic East Asian monolid. ' +
    'Pre-surgery, healthy natural appearance. Natural portrait lighting, photorealistic.',

  puffy:
    'Edit only the eyelids. Keep the person\'s face, skin, hair, and all other features completely unchanged. ' +
    'Transform the eyelids to puffy single eyelid (肿泡眼): ' +
    'heavy fat deposits on upper eyelid, thick and swollen-looking eyelids, eyes appear smaller and heavier. ' +
    'Pre-surgery, natural portrait lighting, photorealistic.',

  inner_double:
    'Edit only the eyelids. Keep the person\'s face, skin, hair, and all other features completely unchanged. ' +
    'Transform the eyelids to inner double (内双): ' +
    'a very subtle crease that is only faintly visible when eyes are fully open, ' +
    'nearly indistinguishable from single eyelid when relaxed — the fold is hidden under the eyelid. ' +
    'Pre-surgery, natural portrait lighting, photorealistic.',
}

export const STEP4_PROMPTS: Record<number, string> = {
  1:
    'Same person after double eyelid surgery, Day 1 recovery selfie. ' +
    'Severe periorbital swelling making eyes look swollen shut, significant purple-red bruising around both eyes, ' +
    'surgical sutures clearly visible along the eyelid crease, eyes can only open slightly. ' +
    'Indoor warm lighting, casual selfie angle, realistic recovery photo.',

  2:
    'Same person after double eyelid surgery, Day 2 recovery selfie. ' +
    'Significant swelling, bruising spreading slightly around the eye sockets (purple tones), ' +
    'sutures still clearly visible, eyes opening about 30%. ' +
    'Indoor lighting, selfie angle, realistic.',

  3:
    'Same person after double eyelid surgery, Day 3 recovery selfie. ' +
    'Swelling still substantial, bruising changing to yellow-green at edges, sutures visible, ' +
    'eyes opening about 40%. Indoor lighting, selfie, realistic.',

  4:
    'Same person after double eyelid surgery, Day 4 recovery selfie. ' +
    'Swelling beginning to reduce noticeably, residual bruising (yellow-purple), sutures visible, ' +
    'eyes opening about 50%. Indoor lighting, selfie, realistic.',

  5:
    'Same person after double eyelid surgery, Day 5 recovery selfie. ' +
    'Moderate swelling, fading bruising turning pale yellow, sutures visible, ' +
    'eyes opening about 60%, double eyelid crease becoming visible. ' +
    'Indoor lighting, selfie, realistic.',

  6:
    'Same person after double eyelid surgery, Day 6 recovery selfie. ' +
    'Mild remaining swelling, faint yellow bruising mostly gone, sutures still in place, ' +
    'eyes opening about 70%, crease clearly visible. ' +
    'Indoor lighting, selfie, realistic.',

  7:
    'Same person after double eyelid surgery, Day 7 recovery selfie, sutures just removed today. ' +
    'Suture marks barely visible as tiny dots at the crease, light pinkness along crease line, ' +
    'mild residual swelling, eyes opening about 80%. ' +
    'Indoor lighting, selfie, realistic.',

  8:
    'Same person after double eyelid surgery, Day 8 recovery selfie. ' +
    'Suture marks fading, double eyelid crease looks natural but slightly firm, ' +
    'minimal swelling, eyes opening about 85%. ' +
    'Indoor lighting, selfie, realistic.',

  9:
    'Same person after double eyelid surgery, Day 9 recovery selfie. ' +
    'Very minimal residual firmness at crease, crease looks increasingly natural, ' +
    'almost fully healed, eyes opening normally. ' +
    'Indoor lighting, selfie, realistic.',

  10:
    'Same person after double eyelid surgery, Day 10 recovery selfie. ' +
    'Fully healed appearance, natural-looking double eyelid, ' +
    'no visible bruising or swelling, very slight firmness at crease that is normal at this stage. ' +
    'Natural indoor selfie lighting, casual and happy expression, realistic.',
}
