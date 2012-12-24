simple-ini
==========

simple-ini provides easy way to work with INI-files.
INI-files format definition has been taken from http://en.wikipedia.org/wiki/INI_file.

Usage
-----

    var SimpleIni = require('simple-ini');
    
    var data = [
            '[owner]',
            'name=John Doe',
            'organization=Acme Widgets Inc.',
            'description=This is long long \\',
            '            long long text.'
        ];
        
    var simpleIni = new SimpleIni(function() { 
            return data.join('\n');
        });
    
    if (simpleIni.hasSection('owner')) {
        console.log(simpleIni.get('owner.name'));
        console.log(simpleIni.get('owner.organization'));
        console.log(simpleIni.get('owner.description'));
    }
    
Installation
------------

Install via npm:

    npm install simple-ini
    
API Documentation
-----------------

* SimpleIni(loadFunction, options) - simple-ini constructor. 
  loadFunction returns INI-file content. options are used to configure
  INI-file parser.
  
* save(saveFunction) - persists INI-file changes. saveFunction is a function
  which stores the file.
  
* hasSection(section) - checks if the section exists.

* hasProperty(property, section) - checks if the property exists in the section.
  If the section is not specified then it checks if global property exists.
  
* get(config) - Gets property's value. config might be 'section.property' or 
  just 'property'. If the config is just a 'property' then the library tries to get
  the global property.
  
Options
-------

* caseSensitive - if the parser is case sensitive or not. Default value is false.

* comments - the list of characters which specify comments. Default value is ';'.

* throwOnDuplicate - Ignores or throws an exception on duplicated. Bu default the library
  throws an exception.

* allowGlobalProperties - Are global properties allowed. By default they are allowed.

* delimiter - key - value pairs delimiter. By default it is '='.

* quotedValues - use ''' or '"' for values. By default they are ignored.

* ignoreWhitespace - Ignored whitespace at the beginning and at the end of a value. Default value 
  is false.

* lineSeparator - INI-file lines separator. By default it is '\n'.
    