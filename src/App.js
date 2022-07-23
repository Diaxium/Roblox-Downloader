/*
    Hello Thanks for using Roblox-Downloader!
    This is a simple script that downloads Roblox assets.
    It is meant to be used to only download the games version history game files.

    Credits :
        Github : https://github.com/Diaxium

    ---------------------------------------------------------------------------------------------------------------------

    How to use:
    1. Replace the Settings.UniverseId with the UniverseId of the game you want to download. You can
         find the UniverseId by going to your game's page and clicking the "..." button by the name of the game.
         Then click the "Configure this Experience" button. You will be redirected to the Configure Experience page.
         In the Url you will see the UniverseId. Example: https://www.roblox.com/universes/configure?id={UniverseId}
    2. Replace the Settings.Security.Key with the cookie value from your Roblox account. You can find this value by
            going to your Roblox account and left clicking on the page and click the "Inspect Element" button. Then
            click the "Application" button. Where you will see a button under "Storage" that says "Cookies" and
            you want to click on the Roblox Url option under "Cookies". There you will see a cookie Named ".ROBLOSECURITY".
            You can copy and paste the "Value" of this cookie into the Settings.Security.Key variable.
    3. Optional: Change the Settings.Pages.Minimum and Settings.Pages.Maximum to the number of pages you want to download.
            The default is 1 because the default of version on one page is 50 usually. Additionally, if you null the
            Settings.Pages.Minimum or Settings.Pages.Maximum, it will download all the pages. Exception is if you
            added to the Settings.Versions array, it will download all the versions.
    4. Optional: Add numbers of the versions you want to download. Example: Settings.Versions = [ 1, 2, 3, 4, 5 ]
    5. Optional: Change the Settings.Path to the path you want to save the files to. Example: Settings.Path = 'Downloads'
             Which will save to the current directory's Downloads folder.
    6. Run the script. To preform this you'll need to use cmd or shell terminal and making sure the location the consoles directory is
            set to the src folder then you can execute "node App.js" if you don't currently have node installed. The application
            will not be able to execute properly. You can install node by going to the following link: https://nodejs.org/en/download/
            Once you have node installed, you may need to exit and reopen your console.

    ---------------------------------------------------------------------------------------------------------------------

    Todo:
    1. [ Major ] Fix the file that's saved. Currently Roblox Studio isn't Excepting something in the files content format. (Probably has
            to do something being included from the downloaded data from the url. Or maybe it's one of the headers that's causing the issue.
            Further research is needed. )
*/

// --------------------------------------------------------------------------------------------------------------------- \\

// Settings - Represents what the application will download.
const Settings = {
    UniverseId : 000000000, // Replace with the UniverseId of the game you want to download.
    Security : { // Change this to the cookie value from your Roblox account.
        Key : ''
    },
    Pages : { // Change this to the number of pages you want to download. If you want to download all the pages, set one of them to null.
        Minimum : 1,
        Maximum : 1
    },
    Versions : [ ], // Add the numbers of the versions you want to download. Example: Settings.Versions = [ 1, 2, 3, 4, 5 ]
    Path : 'Downloads' // Change this to the path you want to save the files to.
};

// Don't change anything below this line unless you know what you're doing.

// --------------------------------------------------------------------------------------------------------------------- \\

// Dependencies
const Roblox = require( 'noblox.js' ); // Could have used something else, but this has other features I may use in the future.
const FileSys = require( 'fs' ); // Only thing I was aware of was the ability to write new folders/files.
const path = require( 'path' ); // Used to get the path of the current directory.

// --------------------------------------------------------------------------------------------------------------------- \\

// GetPlaceInfo - Gets the place info of the place. Example: https://games.roblox.com/v1/games?universeIds=488258380
async function GetPlaceInfo( UniverseId ) {
    console.assert( typeof UniverseId === 'number', 'UniverseId must be a number' );

    let Place = await Roblox.http(
        'https://games.roblox.com/v1/games?universeIds=' + UniverseId,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                cookie: `.ROBLOSECURITY=${ Settings.Security.Key };`
            }
        }
    ).then( Response => JSON.parse( Response ) ).then( Response => Response.data[ 0 ] );


    return Place;
}

// GetPages - Gets the pages of the place and filters them to only include the versions you wanted. Example: https://api.roblox.com/assets/1192833831/versions/?page=1
async function GetPages( UniverseId, InitialPage, FinalPage, Filter ) {
    console.assert( typeof UniverseId === 'number', 'UniverseId must be a number' );
    console.assert( ( Filter && typeof Filter === 'function' ) || !Filter, 'Filter must be a function' );

    let Pages = [];
    const PlaceId = await GetPlaceInfo( UniverseId ).then( Place => Place.rootPlaceId );

    switch( InitialPage != null && FinalPage != null ) {
        case true : {
            switch( InitialPage == 1 && FinalPage == 1 ) {
                case true : {
                    let Page = await Roblox.http(
                        'https://api.roblox.com/assets/' + PlaceId + '/versions/?page=1',
                        {
                            method: 'GET',
                            headers: {
                                Accept: 'application/json',
                                cookie: `.ROBLOSECURITY=${ Settings.Security.Key };`
                            }
                        }
                    );

                    Page = JSON.parse( Page );

                    switch( Filter != null ) {
                        case true : {
                            let FoundPages = await Filter( Page );

                            if ( FoundPages != null ) {
                                Pages.push( FoundPages );
                            }

                            break;
                        }

                        case false : {
                            Pages.push( Page );

                            break;
                        }
                    }

                    break;
                }

                case false : {
                    for ( let Id = InitialPage; Id <= FinalPage; Id++ ) {
                        let Page = await Roblox.http(
                            'https://api.roblox.com/assets/' + PlaceId + '/versions/?page=' + Id,
                            {
                                method: 'GET',
                                headers: {
                                    Accept: 'application/json',
                                    cookie: `.ROBLOSECURITY=${ Settings.Security.Key };`
                                }
                            }
                        );

                        Page = JSON.parse( Page );

                        switch( Filter != null ) {
                            case true : {
                                let FoundPages = await Filter( Page );

                                if ( FoundPages != null ) {
                                    Pages.push( FoundPages );
                                };

                                break;
                            }

                            case false : {
                                Pages.push( Page );

                                break;
                            }
                        }
                    }

                    break;
                }
            }

            break;
        }

        case false : {
            let Page = await Roblox.http(
                'https://api.roblox.com/v2/assets/' + PlaceId + '/versions/',
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        cookie: `.ROBLOSECURITY=${ Settings.Security.Key };`
                    }
                }
            );

            Page = JSON.parse( Page );

            let NextPage = Page.nextPageCursor;

            switch( Filter != null ) {
                case true : {
                    let FoundPages = await Filter( Page.data );

                    if ( FoundPages != null ) {
                        Pages.push( FoundPages );
                    };

                    break;
                }

                case false : {
                    Pages.push( Page.data );

                    break;
                }
            }

            while ( NextPage ) {
                Page = await Roblox.http(
                    'https://api.roblox.com/v2/assets/' + PlaceId + '/versions/?cursor=' + NextPage,
                    {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                            cookie: `.ROBLOSECURITY=${ Settings.Security.Key };`
                        }
                    }
                );

                Page = JSON.parse( Page );

                switch( Filter != null ) {
                    case true : {
                        let FoundPages = await Filter( Page.data );

                        if ( FoundPages != null ) {
                            Pages.push( FoundPages );
                        };

                        break;
                    }

                    case false : {
                        Pages.push( Page.data );

                        break;
                    }
                }

                NextPage = Page.nextPageCursor;
            }

            break;
        }
    }

    return Pages;
}

// FilterVersions - Filters the versions to only include the versions you wanted.
async function FilterVersions( Page ) {
    console.assert( Page, 'Page must be defined' );

    let Versions = [];

    for ( let Version = 0; Version < Page.length; Version++ ) {
        let VersionInfo = Page[ Version ];

        switch( Settings.Versions.includes( VersionInfo.VersionNumber ) ) {
            case true : {
                Versions.push( VersionInfo );

                break;
            }

            case false : {

                break;
            }
        };

    };

    return ( Versions.length > 0 ) ? Versions : null;
};

// DownloadPages - Downloads the arrayed pages returned from GetPages. Example: https://assetdelivery.roblox.com/v1/asset?assetVersionId=2642417122
async function DownloadPages( UniverseId, Pages ) {
    console.assert( typeof UniverseId === 'number', 'UniverseId must be a number' );
    console.assert( Pages, 'Pages must be defined' );


    const PlaceName = await GetPlaceInfo( UniverseId ).then( Place => Place.name );
    const FilePath = `./${ Settings.Path }/${ PlaceName }`;


    try {
        if ( !FileSys.existsSync( `./${ Settings.Path }` ) ) {
            FileSys.mkdirSync( `./${ Settings.Path }` );
        }

        if ( !FileSys.existsSync( FilePath ) ) {
            FileSys.mkdirSync( FilePath );
        }
    } catch (err) {
        console.error(err)
    };

    for ( let PageId = 0; PageId < Pages.length; PageId++ ) {
        const Page = Pages[ PageId ];

        for ( let VersionId = 0; VersionId < Page.length; VersionId++ ) {
            const Version = Page[ VersionId ];
            const Id = Version.Id;
            const Created = Version.Created;
            const VersionNumber = Version.VersionNumber;

            const FileName = `${ PlaceName } - ${ VersionNumber }`;
            const FileExtension = '.rbxl';

            let FileContents = await Roblox.http(
                'https://assetdelivery.roblox.com/v1/asset?assetVersionId=' + Id,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/octet-stream',
                        cookie: `.ROBLOSECURITY=${ Settings.Security.Key };`
                    }
                }
            );

            FileSys.writeFileSync( FilePath + '/' + FileName + FileExtension, FileContents );

            console.log( 'Downloaded version ' + FileName + ' Published on : (' + Created + ')' );
        }
    }

    console.log( '-----------------------------------------------------' );
    console.log( 'Completed!' );
    console.log( ( Settings.Path == 'Downloads' ) ? 'Saved to ' + process.cwd() + '\\Downloads\\' + PlaceName : 'Saved to ' + Settings.Path + '\\' + PlaceName );
};

// Initialize - Initializes the program.
async function Initialize() {
    console.log( 'Roblox Asset Downloader' )
    console.log( '-----------------------------------------------------' );
    console.log( 'Initializing' );

    switch( Settings.Security.Key == null ) {
        case true : {
            console.error( 'Roblox Security Key is not defined' );

            return;
        }

        case false : {
            console.log( 'Roblox Authorization Loaded!' );

            break;
        }
    };

    switch( Settings.Pages.Minimum != null && Settings.Pages.Maximum != null ) {
        case true : {
            console.log( 'Downloading Pages ' + Settings.Pages.Minimum + ' To ' + Settings.Pages.Maximum );

            switch( Settings.Versions.length > 0 ) {
                case true : {
                    console.log( 'Selected Versions [' + Settings.Versions.join( ', ' ) + ']' );
                    console.log( 'Warning if the versions are not found within the specified range, no versions will be downloaded' );

                    break;
                }

                case false : {


                    break;
                }
            };

            break;
        }

        case false : {
            switch( Settings.Versions.length > 0 ) {
                    case true : {
                        console.log( 'Selected Versions [' + Settings.Versions.join( ', ' ) + ']' );

                        break;
                    }

                    case false : {
                        console.log( 'Warning Download All Versions Will Take A While' );

                        break;
                    }
                };

            break;
        }
    };

    console.log( 'Initialization completed!' );
    console.log( '-----------------------------------------------------' );
    console.log( 'Starting download' );

    GetPages( Settings.UniverseId, Settings.Pages.Minimum, Settings.Pages.Maximum, ( Settings.Versions.length > 0 ) ? FilterVersions : null ).then( Pages => DownloadPages( Settings.UniverseId, Pages ) );
};
Initialize();