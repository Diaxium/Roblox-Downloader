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

// Don't change anything below this line unless you know what you're doing.

// --------------------------------------------------------------------------------------------------------------------- \\

// Dependencies
const Utility = require( './Api/Utility.js' );
const Settings = require( './Settings.json' );

// --------------------------------------------------------------------------------------------------------------------- \\

// Filter:
async function Filter( Settings, Page ) {
    let Filtered = [ ];

    for ( let Index = 0; Index < Page.length; Index++ ) {
        const Version = Page[ Index ];

        Filtered.push( Settings.Versions.includes( Version.VersionNumber ) ? Version : null );
    }

    return ( Filtered.length > 0 ) ? Filtered.filter( Element => ( Element !== null ) ) : null;
}

// Initialize:
async function Initialize() {
    console.log( `-> Roblox Asset Downloader <-\n${ '-'.repeat( 20 ) }\nInitializing:` );
    console.assert( Settings.Security.Key !== '' || !Settings.Security.Key.startsWith( '_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_' ), `-> Security Key: Missing or Invalid!` );
    console.log( `-> Security: Authorization loaded!` );
    console.assert( typeof( Settings.UniverseId ) === 'number' || Settings.UniverseId === 0, `-> Universe Id: Missing or Invalid!` );

    const Place_info = await Utility.Place_info( Settings, Settings.UniverseId );

    console.assert( typeof( Place_info ) === 'object', `-> Universe Id: Missing or Invalid!` );
    console.log( `-> Place Id: ${ Place_info.rootPlaceId }\n-> Place Name: ${ Place_info.name }\n-> Place loaded!` );
    console.log( `-> Pages: ${ ( Settings.Pages.Minimum && Settings.Pages.Maximum ) ? ( Settings.Pages.Minimum + ' To ' + Settings.Pages.Maximum ) : 'Any' } -- Warning if no version's are listed and min or max is void then it will download all version! This usually can take a while!` );
    console.log( `-> Versions: ${ ( Settings.Versions.length > 0 ) ? '[' + Settings.Versions.join( ' ' ) + ']' : '[ ]' } -- Warning if no version's are found within the pages limit's, no places will be downloaded!` );
    console.log( `Initialization completed!\n${ '-'.repeat( 20 ) }\nStarting downloads:` )

    return Place_info;
}

// Download:
async function Download( Settings, Place_info ) {
    const Pages = await Utility.Version_history.GetPages( Settings, Place_info, Settings.Pages.Minimum, Settings.Pages.Maximum, ( Settings.Versions.length > 0 ) ? Filter : null );
    const Downloaded = await Utility.Version_history.Download( Settings, Place_info, Pages );

    console.log( `-> Downloaded: ${ Downloaded.length > 1 ? Downloaded.concat( ' ' ) : Downloaded.concat( ) }\nDownloading Completed!` );
}
Initialize().then( async Place_info => await Download( Settings, Place_info) );