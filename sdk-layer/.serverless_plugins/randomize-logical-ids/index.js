function randomString(len, charSet) {
  charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var randomString = ''
  for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length)
      randomString += charSet.substring(randomPoz,randomPoz+1)
  }
  return randomString
}

class RandomizeLogicalIdsPlugin {
  constructor(serverless, options) {
    this.serverless = serverless
    this.log = serverless.cli.consoleLog
    this.custom = serverless.service.custom

    // see https://gist.github.com/HyperBrain/50d38027a8f57778d5b0f135d80ea406
    // for available lifecycle hooks
    this.hooks = {
      'after:aws:package:finalize:mergeCustomProviderResources': this.randomizeLogicalIds.bind(this)
    }
  }

  randomizeLogicalIds() {
    if (this.custom && this.custom.randomizeLogicalIds) {
      this.log('randomizing logical IDs...')

      this.custom.randomizeLogicalIds.forEach(oldId => {
        const suffix = randomString(5)
        const newId = oldId + suffix
        this.log(`${oldId} ==> ${newId}`)

        const template = this.serverless.service.provider.compiledCloudFormationTemplate
        template.Resources[newId] = template.Resources[oldId]
        delete template.Resources[oldId]

        this.updateReference(template.Resources, oldId, newId)
        this.updateReference(template.Outputs, oldId, newId)
      })
    }
  }

  updateReference(root, oldId, newId) {
    for (const prop in root) {
      const value = root[prop]
      if (typeof value === 'string' && value === oldId) {
        root[prop] = newId
      } else if (typeof value === 'object') {
        this.updateReference(value, oldId, newId)
      }
    }
  }
}

module.exports = RandomizeLogicalIdsPlugin