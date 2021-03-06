require 'tower'
knox  = require('knox')
spawn = require('child_process').spawn
which = require('which').sync
path  = require('path')

spawnGrunt = (args = []) ->
  args.push('--config', path.join(process.cwd(), 'grunt.coffee'))

  grunt   = which('grunt')
  watcher = spawn(grunt, args) 
  watcher.stdout.setEncoding('utf8')
  watcher.stderr.setEncoding('utf8')
  watcher.stdout.on 'data', (data) ->
    console.log data.replace(/\n$/m, '') # remove extra line
  watcher.stderr.on 'data', (data) ->
    console.log data.replace(/\n$/m, '')

# Watches and compiles assets to ./public
task 'watch', ->
  spawnGrunt ['start']

# Compiles assets to ./public (see `task 'watch'` for persistent compilation)
task 'build', ->
  spawnGrunt()



# This uploads all of your assets
task 'assets:upload', ->
  invoke 'assets:upload:s3'

# This uploads all of your assets to Amazon Web Services S3
task 'assets:upload:s3', ->
  invoke 'environment'

  # Create a client from your S3 credentials
  client  = knox.createClient Tower.config.credentials.s3

  # Start uploading each asset
  Tower.ApplicationAssets.upload (from, to, headers, callback) ->
    client.putFile from, to, headers, callback

# This bundles all of your assets into neat little files
task 'assets:bundle', ->
  invoke 'environment'
  Tower.ApplicationAssets.bundle(minify: false)

# This task displays the sizes of the assets on the current project
task 'assets:stats', 'Table displaying uncompressed, minified, and gzipped asset sizes', ->
  invoke 'environment'
  Tower.ApplicationAssets.stats()

# This runs the seed file, which initializes your db with data
task 'db:seed', ->
  App = require('tower').Application.instance()
  App.initialize =>
    require './data/seeds'

task 'db:drop', ->
  App = require('tower').Application.instance()
  App.initialize =>
    Tower.StoreMongodb.clean()
    process.nextTick(process.exit)

# This puts your Tower app in production mode, used for special tasks
task 'environment', ->
  Tower.env = 'production'
  # This initializes your Tower application, used for special taks
  Tower.Application.instance().initialize()

# This displays all of the routes for your Tower app
task 'routes', ->
  invoke 'environment'

  result  = []
  routes  = Tower.Route.all()

  methods =
    GET:    'GET'
    POST:   'POST'
    PUT:    'PUT'
    DELETE: 'DELETE'

  rows  = []
  max   = [0, 0, 0, 0]

  # @todo build an ascii table without any borders
  routes.forEach (route, i) ->
    route.options.to ||= _.camelize(route.controller.name, true).replace(/Controller$/, '') + "##{route.controller.action}"
    row = []

    method = methods[route.methods[0].toUpperCase()]
    routePath = route.path.replace('.:format?', '')

    row.push method
    row.push routePath
    row.push route.options.to
    row.push "curl -X #{method} http://localhost:3000#{routePath}.json"

    max.forEach (value, j) ->
      max[j] = Math.max(value, row[j].length)

    rows.push(row)

  rows.forEach (row, i) ->
    row.forEach (column, j) ->
      row[j] = column + _.repeat(' ', max[j] - column.length + 4)

    rows[i] = row.join('')

  process.exit()

task 'jobs', ->
  # make sure tower is loaded so we can get models
  # invoke 'environment'
  # needs to be the same as the current running app (local or remote)
  Tower.env = process.env.ENV || 'development'
  
  Tower.Application.instance().initialize =>
    process.nextTick =>
      kue   = require('kue')
      jobs  = kue.createQueue()

      run = (job, done) =>
        data    = job.data
        klass   = Tower.constant(data.klass)
        method  = data.method
        args    = data.args || []
        args.push(done) if data.async
        klass[method].apply(klass, args)
        done() unless data.async # if it's not async then just callback immediately

      jobs.types (error, types) =>
        throw error if error
        atOnce = 2 # @todo configurable
        for type in types
          jobs.process(type, atOnce, run)
