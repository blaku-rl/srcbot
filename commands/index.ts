import { CustomCommand } from '../custom-types'
import help from './help'
import blaku from './blaku'
import categories from './categories'
import queue from './queue'
import leave from './leave'
import begin from './begin'
import status from './status'

export default [
    help,
    blaku,
    categories,
    queue,
    leave,
    begin,
    status
] as CustomCommand[]