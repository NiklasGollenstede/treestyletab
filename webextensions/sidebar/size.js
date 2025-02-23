/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
'use strict';

import {
  log as internalLogger,
  configs
} from '/common/common.js';

function log(...args) {
  internalLogger('sidebar/size', ...args);
}

let mTabHeight          = 0;
let mTabXOffset         = 0;
let mTabYOffset         = 0;
let mFavIconSize        = 0;
let mFavIconizedTabSize = 0;

export function getTabHeight() {
  return mTabHeight;
}

export function getTabXOffset() {
  return mTabXOffset;
}

export function getTabYOffset() {
  return mTabYOffset;
}

export function getFavIconSize() {
  return mFavIconSize;
}

export function getFavIconizedTabSize() {
  return mFavIconizedTabSize;
}

export function init() {
  update();
  matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addListener(update);
}

export function update() {
  const sizeDefinition = document.querySelector('#size-definition');
  // first, calculate actual favicon size.
  mFavIconSize = document.querySelector('#dummy-favicon-size-box').getBoundingClientRect().height;
  const scale = Math.max(configs.faviconizedTabScale, 1);
  mFavIconizedTabSize = parseInt(mFavIconSize * scale);
  log('mFavIconSize / mFavIconizedTabSize ', mFavIconSize, mFavIconizedTabSize);
  sizeDefinition.textContent = `:root {
    --favicon-size:         ${mFavIconSize}px;
    --faviconized-tab-size: ${mFavIconizedTabSize}px;
  }`;

  const dummyTab = document.querySelector('#dummy-tab');
  const dummyTabRect = dummyTab.getBoundingClientRect();
  mTabHeight = dummyTabRect.height;
  const style  = window.getComputedStyle(dummyTab);
  mTabXOffset = parseFloat(style.marginLeft.replace(/px$/, '')) + parseFloat(style.marginRight.replace(/px$/, ''));
  mTabYOffset = parseFloat(style.marginTop.replace(/px$/, '')) + parseFloat(style.marginBottom.replace(/px$/, ''));

  const labelRect = dummyTab.querySelector('tab-label').getBoundingClientRect();

  log('mTabHeight ', mTabHeight);
  sizeDefinition.textContent += `:root {
    --tab-size: ${mTabHeight}px;
    --tab-x-offset: ${mTabXOffset}px;
    --tab-y-offset: ${mTabYOffset}px;
    --tab-height: var(--tab-size); /* for backward compatibility of custom user styles */
    --tab-label-start-offset: ${labelRect.left - dummyTabRect.left}px;
    --tab-label-end-offset: ${dummyTabRect.right - labelRect.right}px;

    --tab-burst-duration: ${configs.burstDuration}ms;
    --indent-duration:    ${configs.indentDuration}ms;
    --collapse-duration:  ${configs.collapseDuration}ms;
    --out-of-view-tab-notify-duration: ${configs.outOfViewTabNotifyDuration}ms;
    --visual-gap-hover-animation-delay: ${configs.cancelGapSuppresserHoverDelay}ms;
  }`;
}

export function calc(expression) {
  const box = document.createElement('span');
  const style = box.style;
  style.display       = 'inline-block';
  style.left          = 0;
  style.pointerEvents = 'none';
  style.position      = 'fixed';
  style.top           = 0;
  style.height        = `calc(${expression})`;
  style.zIndex        = 0;
  document.body.appendChild(box);
  const height = box.getBoundingClientRect().height;
  box.parentNode.removeChild(box);
  return height;
}
