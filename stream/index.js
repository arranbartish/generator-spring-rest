'use strict';
var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('underscore.string'),
    shelljs = require('shelljs'),
    scriptBase = require('../script-base'),
    packagejs = require(__dirname + '/../package.json'),
    crypto = require("crypto"),
    mkdirp = require('mkdirp'),
    html = require("html-wiring"),
    ejs = require('ejs');

var StreamGenerator = module.exports = function StreamGenerator(args, options, config) {

	yeoman.generators.NamedBase.apply(this, arguments);

	this.baseName = this.config.get('baseName');
    this.packageName = this.config.get('packageName');
    this.packageNameGenerated = this.config.get('packageNameGenerated');
    this.packageFolder = this.config.get('packageFolder');
}

util.inherits(StreamGenerator, yeoman.generators.Base);
util.inherits(StreamGenerator, scriptBase);

StreamGenerator.prototype.askForFields = function askForFields() {

	var cb = this.async();
	var questions = 2;
	var prompts = [
        {
            type: 'input',
            name: 'groupName',
            validate: function (input) {
                if (/^([a-zA-Z0-9_]*)$/.test(input)) return true;
                return 'Your group name cannot contain special characters or a blank space, using the default name instead';
            },
            message: '(1/' + questions + ') What is the group name of your application?',
            default: 'test'
        },
        {
            type: 'list',
            name: 'channelType',
            message: '(2/' + questions + ') What kind of message endpoint would you like to create?',
            choices: [
                {
                    value: 'sink',
                    name: 'Sink'
                },
                {
                    value: 'source',
                    name: 'Source'
                },
                {
                    value: 'processor',
                    name: 'Processor'
                }
            ],
            default: 0
        },
        {
            when: function (response) {
                return response.channelType == 'sink' || response.channelType == 'processor';
            },
            type: 'input',
            name: 'sinkName',
            validate: function (input) {
                if (/^([a-zA-Z0-9_]*)$/.test(input)) return true;
                return 'Your name cannot contain special characters or a blank space, using the default name instead';
            },
            message: '(3/' + questions + ') What do you want to call the input message queue?'
            
        },
        {
            when: function (response) {
                return response.channelType == 'source' || response.channelType == 'processor';
            },
            type: 'input',
            name: 'sourceName',
            validate: function (input) {
                if (/^([a-zA-Z0-9_]*)$/.test(input)) return true;
                return 'Your name cannot contain special characters or a blank space, using the default name instead';
            },
            message: '(4/' + questions + ') What do you want to call the output message queue?'
            
        },
        {
            type: 'list',
            name: 'generateDto',
            message: '(5/' + questions + ') Do you want the DTO generated? Note that this DTO will be used as the object for the stream endpoints.',
            choices: [
                {
                    value: 'yes',
                    name: 'Yes'
                },
                {
                    value: 'no',
                    name: 'No'
                }
            ],
            default: 0
        }
    ];


    // spring.cloud.stream.bindings.input.group
    // Partisioning.

    this.entityClass        = _.capitalize(this.name);
    this.entityInstance     = _.decapitalize(this.name);

	this.prompt(prompts, function (props) {
        this.channelType        = props.channelType;
        this.groupName          = props.groupName
        this.sinkName           = props.sinkName;
        this.sourceName         = props.sourceName;
        this.generateDto        = props.generateDto;
        cb();
    }.bind(this));
};

StreamGenerator.prototype.buildStack = function buildStack() {
    this.packageFolder = this.packageName.replace(/\./g, '/');

    this.template('src/main/java/package/stream/_MetaData.java',     'src/main/java/'+ this.packageFolder +'/stream/' + this.entityClass + 'MetaData.java', this, {});

    if (this.generateDto == 'yes' ) {
        this.template('src/main/java/package/dto/_Dto.java',     'src/main/java/'+ this.packageFolder +'/dto/' + this.entityClass + 'Dto.java', this, {});
    }

    if (this.channelType == 'sink') {
        this.template('src/main/java/package/stream/_Sink.java',     'src/main/java/'+ this.packageFolder +'/stream/' + this.entityClass + 'Sink.java', this, {});
    }

    if (this.channelType == 'source') {
        this.template('src/main/java/package/stream/_Source.java',     'src/main/java/'+ this.packageFolder +'/stream/' + this.entityClass + 'Source.java', this, {});
    }

    if (this.channelType == 'processor') {
        this.template('src/main/java/package/stream/_Processor.java',     'src/main/java/'+ this.packageFolder +'/stream/' + this.entityClass + 'Processor.java', this, {});
    }
};









