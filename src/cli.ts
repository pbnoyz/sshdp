#!/usr/bin/env node

import { handleError } from './errors'
import { main } from './main'

main().catch(handleError)
