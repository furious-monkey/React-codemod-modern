"use strict";

jest.autoMockOff();
const { defineTest } = require("jscodeshift/dist/testUtils");

defineTest(__dirname, "removeImmutableMapCalls");
