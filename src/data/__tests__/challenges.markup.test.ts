import { getChallengeById } from '../challenges'
describe('introductory semantic markup', () => {
  it.each([['intro-1', 'header', 'h1'], ['intro-2', 'section', 'p']])('validates %s using actual inert elements', (id, parent, child) => {
    const check = getChallengeById(id)!.validate
    expect(check(`<${parent} aria-label="Area"><${child} class="title">Colony</${child}></${parent}>`)).toBe(true)
    expect(check(`<!-- <${parent}><${child}>Colony</${child}></${parent}> -->`)).toBe(false)
    expect(check(`<${parent}></${parent}><${child}>Outside</${child}>`)).toBe(false)
    expect(check(`<script>"<${parent}><${child}>Fake</${child}></${parent}>"</script>`)).toBe(false)
    expect(check(`<template><${parent}><${child}>Hidden</${child}></${parent}></template>`)).toBe(false)
  })
})
