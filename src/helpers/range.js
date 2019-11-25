/**
 * Range helper
 *
 * @author Richard Persson
 * @version 1.0.0
 */

'use strict'

/**
 * Gets every integer between two integers with a step option.
 *
 * @export
 * @param {number} start An integer to start from.
 * @param {number} end An integer to end with.
 * @param {number} [step=1] The step to jump between the two integers.
 * @returns {array} An array with integers.
 */
export function range (start, end, step = 1) {
  const num = Math.floor((end - start) / step) + 1
  return Array(num).fill().map((_, idx) => start + (idx * step))
}
