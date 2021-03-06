import { directive as inputDirective, transform as inputTransform } from './input';
import { directive as uploadDirective, transform as uploadTransform } from './upload'
import { directive as crudDirective, transform as crudTransform } from './crud'
import { directive as configurableDirective, transform as configurableTransform } from './configurable'
import { directives as generatedDirectives } from './generate'

export const directives = [ 
    inputDirective,
    configurableDirective,
    ...generatedDirectives
]

export const directiveTransforms = [ 
    inputTransform,
    configurableTransform
]