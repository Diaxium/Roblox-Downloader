// Roblox Web Api : Assets.

// --------------------------------------------------------------------------------------------------------------------- \\

// Dependencies
const Axios = require( 'axios' );
const FileSys = require( 'fs' );

// --------------------------------------------------------------------------------------------------------------------- \\

// Version_history:
const Version_history = {
    // GetPage:
    async GetPage ( Settings, Place_info, Filter, Cursor ) {
        return await Axios.get(
            'https://api.roblox.com/v2/assets/' + Place_info.rootPlaceId + '/versions/',
            {
                params : ( Cursor ? { cursor : Cursor } : null ),

                headers: {
                    Accept: 'application/json',
                    cookie: `.ROBLOSECURITY=${ Settings.Security.Key };`
                }
            }
        ).then( Response => Response.data.data ).then( async Page => ( Filter ? await Filter( Settings, Page ) : !Filter ? Page : null ) );
    },

    // GetAll:
    async GetAll ( Settings, Place_info, Filter ) {
        let Pages = [ ];
        let Page = await this.GetPage( Settings, Place_info, Filter );

        Pages.push( Page );

        if ( !Page.nextPageCursor ) {
            return Pages;
        }

        while ( Page.nextPageCursor ) {
            Page = await this.GetPage( Settings, Place_info, Filter, Page.nextPageCursor );

            Pages.push( Page );
        }

        console.log( Pages );

        return Pages;
    },

    // GetPages:
    async GetPages ( Settings, Place_info, Initial, Final, Filter ) {
        let Pages = ( ( !Initial || !Final ) ? await this.GetAll( Settings, Place_info, Filter ) : [ ] );
        Pages.push( ( Initial && Final && ( Initial !== Final ) )  ? await this.GetPage( Settings, Place_info, Filter ) : null );
        Pages.push( ( Initial && Final && ( Initial === Final ) )  ? await this.GetAll( Settings, Place_info, Filter ).then( Pages => Pages[ ( Initial === 1 ) ? 0 : Initial ] ) : null );

        return Pages.filter( Element => ( Element !== null ) );
    },

    // Download:
    async Download ( Settings, PlaceInfo, Pages ) {
        let Downloaded = [ ];
        let File = {
            Path : `./${ Settings.Path }/`,
            Name : PlaceInfo.name,
            Extension : '.rbxlx'
        };
        File.Full_path = `${ File.Path }/${ File.Name }`;

        try {
            if ( !FileSys.existsSync( `./${ Settings.Path }` ) ) {
                await FileSys.mkdirSync( `./${ Settings.Path }` );
            }

            if ( !FileSys.existsSync( File.Full_path ) ) {
                FileSys.mkdirSync( File.Full_path );
            }
        } catch ( err ) {
            console.error( err )
        }

        for ( let Index = 0; Index < Pages.length; Index++ ) {
            const Page = Pages[ Index ];

            for ( let Sub_index = 0; Sub_index < Page.length; Sub_index++ ) {
                const Version = Page[ Sub_index ];
                const Version_path = `${ File.Name } - ${ Version.VersionNumber }`;

                let Place = await Axios.get(
                    'https://assetdelivery.roblox.com/v1/asset',
                    {
                        params : {
                            assetVersionId : Version.Id
                        },

                        headers : {
                            Accept: 'application/json',
                            cookie: `.ROBLOSECURITY=${ Settings.Security.Key };`
                        }
                    }
                );

                await FileSys.promises.writeFile( `${ File.Full_path }/${ Version_path }${ File.Extension }`, Place.data, { ObjectEncodingOptions : 'utf8' } )

                Downloaded.push( Version_path );
                console.log( `-> Download Successful: [Version: ${ Version.VersionNumber }][Published: ${ Version.Created }]`)
            }
        }

        return Downloaded.filter( Element => Element !== null );
    }
};

// Place_info:
async function Place_info( Settings, Universe_id ) {
    return await Axios.get(
        'https://games.roblox.com/v1/games',
        {
            params : {
                universeIds : Universe_id
            },

            headers : {
                Accept: 'application/json',
                cookie: `.ROBLOSECURITY=${ Settings.Security.Key };`
            }
        }
    ).then( Response => Response.data.data[ 0 ] );
}

module.exports.Version_history = Version_history;
module.exports.Place_info = Place_info;