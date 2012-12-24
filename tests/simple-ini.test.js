var SimpleIniTests = (function() {
    var SimpleIni = require('./../lib/simple-ini.js');

    var runBasicTest = function(data, test, options) {
        var totalSections,
            totalProperties,
            section,
            property;
            
        var simpleIni = new SimpleIni(function() { 
                return data.join('\n'); 
            },
            options);
        
        totalSections = 0;
        for (section in simpleIni) {
            totalSections++
            totalProperties = 0;    
            for (property in simpleIni[section]) {
                totalProperties++;
            }
            
            if (section === 'owner') {
                test.equal(2, totalProperties, 'Bad properties for section "' + section + '"');
            }
            else {
                test.equal(3, totalProperties, 'Bad properties for section "' + section + '"');
            }
        }
        
        test.equal(2, totalSections, 'Bad sections');
        
        test.equal(true, simpleIni.hasSection('owner'));
        test.equal(true, simpleIni.hasProperty('name', 'owner'));
        test.equal(false, simpleIni.hasProperty('name'));           // Try global property
        test.equal(false, simpleIni.hasSection('fake'));
        
        test.equal('John Doe', simpleIni.get('owner.name'));
        test.equal('Acme Widgets Inc.', simpleIni.get('owner.organization'));
        test.equal('192.0.2.62', simpleIni.get('database.server'));
        test.equal('143', simpleIni.get('database.port'));
    };

    var runGlobalPropertiesTest = function(data, test) {
        var simpleIni = new SimpleIni(function() { 
                return data.join('\n'); 
            },
            {
                allowGlobalProperties: true
            });   
        
        test.equal('John Doe', simpleIni.get('name'));
        test.equal('Acme Widgets Inc.', simpleIni.get('organization'));
    }

    return {
        'Bad section name': function(test) {
            var data = [
                '; last modified 1 April 2001 by John Doe',
                'owner',
                'name=John Doe',
                'organization=Acme Widgets Inc.'
            ];
            
            test.throws(function() {
                    var simpleIni = new SimpleIni(function() { 
                        return data.join('\n'); 
                    });   
                }, 
                Error);
            
            test.done();
        },
        
        'Simple parser (UNIX)': function(test) {
            var data = [
                '; last modified 1 April 2001 by John Doe',
                '[owner]',
                '; date=20101010',
                'name=John Doe',
                'organization=Acme Widgets Inc.',
                '',
                '    [database]    ',
                '    ; use IP address in case network name resolution is not working',
                'server=192.0.2.62',
                'port=143',
                'name=Andrew Grey'
            ];
            
            runBasicTest(data, test);
            test.done();
        },
        
        'Simple parser (Windows)': function(test) {
            var data = [
                '; last modified 1 April 2001 by John Doe\r',
                '[owner]\r',
                '; date=20101010\r',
                'name=John Doe\r',
                'organization=Acme Widgets Inc.\r',
                '\r',
                '    [database]    \r',
                '    ; use IP address in case network name resolution is not working\r',
                'server=192.0.2.62\r',
                'port=143\r',
                'name=Andrew Grey\r'
            ];
            
            runBasicTest(data, test, { lineSeparator: '\r\n' });
            test.done();
        },
        
        'Multiline value': function(test) {
            var data = [
                '; last modified 1 April 2001 by John Doe',
                '[owner]',
                'name=John Doe',
                'organization=Acme Widgets Inc.',
                'definition=This is line 1, \\',
                '            line 2, \\',
                '            line 3, \\',
                '            line 4.',
                '', 
                '[database]',
                '; use IP address in case network name resolution is not working',
                'server=192.0.2.62',
                'port=143',
                'file=payroll.dat',
                'steps=step 1 \\',
                '      and step 2'
            ];
            
            var simpleIni = new SimpleIni(function() { 
                    return data.join('\n'); 
                });
               
            test.equal('John Doe', simpleIni.get('owner.name'));
            test.equal('Acme Widgets Inc.', simpleIni.get('owner.organization'));
            test.equal('This is line 1, line 2, line 3, line 4.', simpleIni.get('owner.definition'));
            test.equal('192.0.2.62', simpleIni.get('database.server'));
            test.equal('143', simpleIni.get('database.port'));
            test.equal('payroll.dat', simpleIni.get('database.file'));
            test.equal('step 1 and step 2', simpleIni.get('database.steps'));
            test.done();
        },
        
        'Create new ini-file': function(test) {
            var data;
            var simpleIni = new SimpleIni();
            simpleIni.owner = {};
            simpleIni.owner.name = 'John Doe';
            simpleIni.owner.organization = 'Acme Widgets Inc.'
            simpleIni.database = {};
            simpleIni.database.server = '192.0.2.62';
            simpleIni.database.port = 143;
            simpleIni.database.name = 'Andrew Grey';
            test.throws(function() {
                    simpleIni.save();
                },
                Error);
            simpleIni.save(function(text) {
                    data = text.split('\n');
                });
                
            runBasicTest(data, test);
            test.done();
        },
        
        'Parse, modify and save ini-file': function(test) {
             var data = [
                '; last modified 1 April 2001 by John Doe',
                '[owner]',
                '; date=20101010',
                'name=John Doe',
                'organization=Acme Widgets Inc.'
            ];
            
            var simpleIni = new SimpleIni(function(test) { 
                    return data.join('\n'); 
                });    
            simpleIni.database = {};
            simpleIni.database.server = '192.0.2.62';
            simpleIni.database.port = 143;
            simpleIni.database.name = 'Andrew Grey';
            simpleIni.save(function(text) {
                    data = text.split('\n');
                });
                
            runBasicTest(data, test);
            test.done();
        },

        'Save global property when it is forbidden': function(test) {
            var simpleIni = new SimpleIni(null, { allowGlobalProperties: false });  
            simpleIni.globalToFail = 'testing';
            test.throws(function() {
                    simpleIni.save(function() {});
                },
                Error);
            test.done();
        },
        
        'Save global property': function(test) {
            var data;
            var simpleIni = new SimpleIni(null, { allowGlobalProperties: true });
            simpleIni.name = 'John Doe';
            simpleIni.organization = 'Acme Widgets Inc.';
            simpleIni.save(function(text) {
                data = text.split('\n');
            });
            
            runGlobalPropertiesTest(data, test);
            test.done();
        },
        
        'Parse global properties': function(test) {
            var data = [
                'name=John Doe',
                'organization=Acme Widgets Inc.'
            ];
            
            runGlobalPropertiesTest(data, test);
            test.done();
        },
        
        'Fail for global properties': function(test) {
            var data = [
                'name=John Doe',
                'organization=Acme Widgets Inc.'
            ];
            
            test.throws(function() {
                    var simpleIni = new SimpleIni(function() { 
                            return data.join('\n'); 
                        },
                        {
                            allowGlobalProperties: false
                        });   
                }, 
                Error);
            
            test.done();
        },
        
        'Parse Case Sensitive': function(test) {
            var data = [
                '[owner]',
                'name=John Doe',
                'Name=Ben Jonson'
            ];
            
            var simpleIni = new SimpleIni(function() { 
                    return data.join('\n'); 
                },
                {
                    caseSensitive: true,
                    throwOnDuplicate: true
                });   
            
            test.equal(true, simpleIni.hasProperty('name', 'owner'));
            test.equal(true, simpleIni.hasProperty('Name', 'owner'));
            test.equal(false, simpleIni.hasProperty('NAME', 'owner'));
            test.equal('John Doe', simpleIni.get('owner.name'));
            test.equal('Ben Jonson', simpleIni.get('owner.Name'));
            test.done();
        },
        
        'Raise error for duplicates with case insensitive': function(test) {
            var data = [
                '[owner]',
                'name=John Doe',
                'NAME=Acme Widgets Inc.'
            ];
            
            test.throws(function() {
                    var simpleIni = new SimpleIni(function() { 
                            return data.join('\n'); 
                        },
                        {
                            caseSensitive: false,
                            throwOnDuplicate: true
                        });   
                }, 
                Error);
            
            test.done();
        },
        
        'Raise error for duplicates': function(test) {
            var data = [
                '[owner]',
                'name=John Doe',
                'name=Acme Widgets Inc.'
            ];
            
            test.throws(function() {
                    var simpleIni = new SimpleIni(function() { 
                            return data.join('\n'); 
                        },
                        {
                            caseSensitive: true,
                            throwOnDuplicate: true
                        });   
                }, 
                Error);
            
            test.done();
        },
        
        'Raise error for duplicates with case insensitive (sections)': function(test) {
            var data = [
                '[owner]',
                'name=John Doe',
                '[Owner]',
                'organization=Acme Widgets Inc.'
            ];
            
            test.throws(function() {
                    var simpleIni = new SimpleIni(function() { 
                            return data.join('\n'); 
                        },
                        {
                            caseSensitive: false,
                            throwOnDuplicate: true
                        });   
                }, 
                Error);
            
            test.done();
        },
        
        'Raise error for duplicates (sections)': function(test) {
            var data = [
                '[owner]',
                'name=John Doe',
                '[owner]',
                'organization=Acme Widgets Inc.'
            ];
            
            test.throws(function() {
                var simpleIni = new SimpleIni(function() { 
                        return data.join('\n'); 
                    },
                    {
                        caseSensitive: true,
                        throwOnDuplicate: true
                    });   
                }, 
                Error);
            
            test.done();
        },
        
        'Parse case sensitive sections (no duplicates)': function(test) {
            var data = [
                '[owner]',
                'name=John Doe',
                '[Owner]',
                'name=Acme Widgets Inc.'
            ];
            
            var simpleIni = new SimpleIni(function() { 
                    return data.join('\n'); 
                },
                {
                    caseSensitive: true,
                    throwOnDuplicate: true
                });   
            
            test.equal('John Doe', simpleIni.get('owner.name'));
            test.equal('Acme Widgets Inc.', simpleIni.get('Owner.name'));
            test.done();
        },
        
        'Ignore duplicates': function(test) {
            var data = [
                '[owner]',
                'name=John Doe',
                'name=Acme Widgets Inc.'
            ];
            
            var simpleIni = new SimpleIni(function() { 
                    return data.join('\n'); 
                },
                {
                    caseSensitive: true,
                    throwOnDuplicate: false
                });   
            
            test.equal('John Doe', simpleIni.get('owner.name'));
            test.done();
        },
        
        'Ignore duplicates (case insensitive)': function(test) {
            var data = [
                '[owner]',
                'Name=John Doe',
                'name=Acme Widgets Inc.'
            ];
            
            var simpleIni = new SimpleIni(function() { 
                    return data.join('\n'); 
                },
                {
                    caseSensitive: false,
                    throwOnDuplicate: false
                });   
            
            test.equal('John Doe', simpleIni.get('owner.name'));
            test.done();
        },
        
        'Ignore duplicates (sections)': function(test) {
            var data = [
                '[owner]',
                'name=John Doe',
                '[owner]',
                'organization=Acme Widgets Inc.'
            ];
            
            var simpleIni = new SimpleIni(function() { 
                    return data.join('\n'); 
                },
                {
                    caseSensitive: true,
                    throwOnDuplicate: false
                });   
            
            test.equal('John Doe', simpleIni.get('owner.name'));
            test.equal('Acme Widgets Inc.', simpleIni.get('owner.organization'));
            test.done();
        },
        
        'Ignore duplicates (sections, case insensitive)': function(test) {
            var data = [
                '[owner]',
                'name=John Doe',
                '[Owner]',
                'organization=Acme Widgets Inc.'
            ];
            
            var simpleIni = new SimpleIni(function() { 
                    return data.join('\n'); 
                },
                {
                    caseSensitive: false,
                    throwOnDuplicate: false
                });   
            
            test.equal('John Doe', simpleIni.get('owner.name'));
            test.equal('Acme Widgets Inc.', simpleIni.get('owner.organization'));
            test.done();
        },
        
        'Custom comments (#, // and ;)': function(test) {
            var data = [
                '; last modified 1 April 2001 by John Doe',
                '[owner]',
                'name=John Doe',
                'organization=Acme Widgets Inc.',
                '',
                '[database]',
                '# use IP address in case network name resolution is not working',
                'server=192.0.2.62',
                '// Default port is 21',
                'port=143',
                'name=Andrew Grey'
            ];
            
            runBasicTest(
                data, 
                test,
                {
                    comments: [';', '#', '//']
                });
            test.done();
        },
        
        'Custom delimiter (:)': function(test) {
            var data = [
                '; last modified 1 April 2001 by John Doe',
                '[owner]',
                'name:John Doe',
                'organization:Acme Widgets Inc.',
                '',
                '[database]',
                'server:192.0.2.62',
                'port:143',
                'name:Andrew Grey'
            ];
            
            runBasicTest(
                data, 
                test,
                {
                    delimiter: ':'
                });
            test.done();
        },
        
        'Varify quoted values': function(test) {
            var data = [
                '; last modified 1 April 2001 by John Doe',
                '[owner]',
                'name=\'John \\',
                '       Doe\'',
                'organization="Acme Widgets Inc."',
                '',
                '[database]',
                'server=\'192.0.2.62\'',
                'port="143"',
                'name=\'Andrew Grey\''
            ];
            
            runBasicTest(
                data, 
                test,
                {
                    quotedValues: true
                });
            test.done();
        },
        
        'Ignore whitespace in values': function(test) {
            var data = [
                '[owner]',
                'name=    John Doe    ',
                'organization= Acme Widgets Inc. ',
            ];
            
            var simpleIni = new SimpleIni(function() { 
                    return data.join('\n'); 
                },
                {
                    ignoreWhitespace: true
                });   
            
            test.equal('John Doe', simpleIni.get('owner.name'));
            test.equal('Acme Widgets Inc.', simpleIni.get('owner.organization'));
            test.done();
        },
        
        'Leave whitespace in values': function(test) {
            var data = [
                '[owner]',
                'name=    John Doe    ',
                'organization= Acme Widgets Inc. ',
            ];
            
            var simpleIni = new SimpleIni(function() { 
                    return data.join('\n'); 
                });   
            
            test.equal('    John Doe    ', simpleIni.get('owner.name'));
            test.equal(' Acme Widgets Inc. ', simpleIni.get('owner.organization'));
            test.done();
        },
        
        'Get/Has - case sensitive': function(test) {
            var data = [
                '[owner]',
                'name=John Doe',
                'organization=Acme Widgets Inc.'
            ];
            
            var simpleIni = new SimpleIni(function() { 
                    return data.join('\n'); 
                },
                {
                    caseSensitive: true
                });   
            
            test.equal(true, simpleIni.hasSection('owner'));
            test.equal(false, simpleIni.hasSection('OWNER'));
            test.equal(true, simpleIni.hasProperty('name', 'owner'));
            test.equal(false, simpleIni.hasProperty('Name', 'OWNER'));
            
            test.equal('John Doe', simpleIni.get('owner.name'));
            test.equal('Acme Widgets Inc.', simpleIni.get('owner.organization'));
            test.equal(null, simpleIni.get('OWNER.NAME'));
            test.equal(null, simpleIni.get('Owner.Organization'));
            test.done();
        },
        
        'Get/Has - case insensitive': function(test) {
            var data = [
                '[owner]',
                'name=John Doe',
                'organization=Acme Widgets Inc.'
            ];
            
            var simpleIni = new SimpleIni(function() { 
                    return data.join('\n'); 
                },
                {
                    caseSensitive: false
                });   
            
            test.equal(true, simpleIni.hasSection('owner'));
            test.equal(true, simpleIni.hasSection('OWNER'));
            test.equal(true, simpleIni.hasProperty('name', 'owner'));
            test.equal(true, simpleIni.hasProperty('Name', 'OWNER'));
            
            test.equal('John Doe', simpleIni.get('owner.name'));
            test.equal('Acme Widgets Inc.', simpleIni.get('owner.organization'));
            test.equal('John Doe', simpleIni.get('OWNER.NAME'));
            test.equal('Acme Widgets Inc.', simpleIni.get('Owner.Organization'));
            test.done();
        }
    };
})();

if (typeof module != 'undefined') {
    module.exports = SimpleIniTests;
}
