/**
 * Copyright (c) 2013-2019 Memba Sarl. All rights reserved.
 * Sources at https://github.com/Memba
 */

const res = {
    // basetool
    basetool: {
        top: { title: 'Pos. Haut' },
        left: { title: 'Pos. Gauche' },
        height: { title: 'Hauteur' },
        width: { title: 'Largeur' },
        rotate: { title: 'Rotation' },
        icons: {
            // Incors O-Collection check.svg
            // success: '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="1024px" height="1024px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink"><path id="curve0" fill="#76A797" d="M3840 5760l3934 -3934c124,-124 328,-124 452,0l1148 1148c124,124 124,328 0,452l-5308 5308c-124,124 -328,124 -452,0l-2748 -2748c-124,-124 -124,-328 0,-452l1148 -1148c124,-124 328,-124 452,0l1374 1374z"/></svg>';
            success:
                'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmaWxsLXJ1bGU9Im5vbnplcm8iIGNsaXAtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iMCAwIDEwMjQwIDEwMjQwIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggaWQ9ImN1cnZlMCIgZmlsbD0iIzc2QTc5NyIgZD0iTTM4NDAgNTc2MGwzOTM0IC0zOTM0YzEyNCwtMTI0IDMyOCwtMTI0IDQ1MiwwbDExNDggMTE0OGMxMjQsMTI0IDEyNCwzMjggMCw0NTJsLTUzMDggNTMwOGMtMTI0LDEyNCAtMzI4LDEyNCAtNDUyLDBsLTI3NDggLTI3NDhjLTEyNCwtMTI0IC0xMjQsLTMyOCAwLC00NTJsMTE0OCAtMTE0OGMxMjQsLTEyNCAzMjgsLTEyNCA0NTIsMGwxMzc0IDEzNzR6Ii8+PC9zdmc+',

            // Incors O-Collection delete.svg
            // failure: '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="1024px" height="1024px" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="nonzero" clip-rule="evenodd" viewBox="0 0 10240 10240" xmlns:xlink="http://www.w3.org/1999/xlink"><path id="curve0" fill="#E68497" d="M1273 7156l2037 -2036 -2037 -2036c-124,-125 -124,-328 0,-453l1358 -1358c125,-124 328,-124 453,0l2036 2037 2036 -2037c125,-124 328,-124 453,0l1358 1358c124,125 124,328 0,453l-2037 2036 2037 2036c124,125 124,328 0,453l-1358 1358c-125,124 -328,124 -453,0l-2036 -2037 -2036 2037c-125,124 -328,124 -453,0l-1358 -1358c-124,-125 -124,-328 0,-453z"/></svg>',
            failure:
                'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMTAyNHB4IiBoZWlnaHQ9IjEwMjRweCIgc2hhcGUtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIHRleHQtcmVuZGVyaW5nPSJnZW9tZXRyaWNQcmVjaXNpb24iIGltYWdlLXJlbmRlcmluZz0ib3B0aW1pemVRdWFsaXR5IiBmaWxsLXJ1bGU9Im5vbnplcm8iIGNsaXAtcnVsZT0iZXZlbm9kZCIgdmlld0JveD0iMCAwIDEwMjQwIDEwMjQwIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggaWQ9ImN1cnZlMCIgZmlsbD0iI0U2ODQ5NyIgZD0iTTEyNzMgNzE1NmwyMDM3IC0yMDM2IC0yMDM3IC0yMDM2Yy0xMjQsLTEyNSAtMTI0LC0zMjggMCwtNDUzbDEzNTggLTEzNThjMTI1LC0xMjQgMzI4LC0xMjQgNDUzLDBsMjAzNiAyMDM3IDIwMzYgLTIwMzdjMTI1LC0xMjQgMzI4LC0xMjQgNDUzLDBsMTM1OCAxMzU4YzEyNCwxMjUgMTI0LDMyOCAwLDQ1M2wtMjAzNyAyMDM2IDIwMzcgMjAzNmMxMjQsMTI1IDEyNCwzMjggMCw0NTNsLTEzNTggMTM1OGMtMTI1LDEyNCAtMzI4LDEyNCAtNDUzLDBsLTIwMzYgLTIwMzcgLTIwMzYgMjAzN2MtMTI1LDEyNCAtMzI4LDEyNCAtNDUzLDBsLTEzNTggLTEzNThjLTEyNCwtMTI1IC0xMjQsLTMyOCAwLC00NTN6Ii8+PC9zdmc+',

            // Incors O-Collection sign_warning.svg
            // warning: '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" clip-rule="evenodd" viewBox="0 0 10240 10240"><path fill="#EDC87E" d="M5680 1282l3846 6712c117 205 117 439 0 644s-319 322-554 322H1281c-234 0-436-117-553-322s-117-439 0-644l3846-6712c117-205 318-322 553-322s436 117 553 322zm-560 318L1280 8320h7680L5120 1600z"/><path fill="gray" d="M5120 6720c353 0 640 287 640 640s-287 640-640 640-640-287-640-640 287-640 640-640zm-320-2880h640c176 0 320 144 320 320v802c0 110-12 204-38 311l-252 1006c-18 72-81 121-155 121h-390c-74 0-137-49-155-121l-252-1006c-26-107-38-201-38-311v-802c0-176 144-320 320-320z"/></svg>',
            warning:
                'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIHNoYXBlLXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgY2xpcC1ydWxlPSJldmVub2RkIiB2aWV3Qm94PSIwIDAgMTAyNDAgMTAyNDAiPjxwYXRoIGZpbGw9IiNFREM4N0UiIGQ9Ik01NjgwIDEyODJsMzg0NiA2NzEyYzExNyAyMDUgMTE3IDQzOSAwIDY0NHMtMzE5IDMyMi01NTQgMzIySDEyODFjLTIzNCAwLTQzNi0xMTctNTUzLTMyMnMtMTE3LTQzOSAwLTY0NGwzODQ2LTY3MTJjMTE3LTIwNSAzMTgtMzIyIDU1My0zMjJzNDM2IDExNyA1NTMgMzIyem0tNTYwIDMxOEwxMjgwIDgzMjBoNzY4MEw1MTIwIDE2MDB6Ii8+PHBhdGggZmlsbD0iZ3JheSIgZD0iTTUxMjAgNjcyMGMzNTMgMCA2NDAgMjg3IDY0MCA2NDBzLTI4NyA2NDAtNjQwIDY0MC02NDAtMjg3LTY0MC02NDAgMjg3LTY0MCA2NDAtNjQwem0tMzIwLTI4ODBoNjQwYzE3NiAwIDMyMCAxNDQgMzIwIDMyMHY4MDJjMCAxMTAtMTIgMjA0LTM4IDMxMWwtMjUyIDEwMDZjLTE4IDcyLTgxIDEyMS0xNTUgMTIxaC0zOTBjLTc0IDAtMTM3LTQ5LTE1NS0xMjFsLTI1Mi0xMDA2Yy0yNi0xMDctMzgtMjAxLTM4LTMxMXYtODAyYzAtMTc2IDE0NC0zMjAgMzIwLTMyMHoiLz48L3N2Zz4='
        }
    },

    // validation messages
    messages: {
        invalidAltText:
            'Un(e) {0} en page {1} nécessite un texte alternatif dans les attributs d’affichage.',
        invalidAudioFile:
            'Un(e) {0} en page {1} nécessite un fichier mp3 dans les attributs d’affichage.',
        invalidColor:
            'Un(e) {0} on page {1} a une couleur invalide dans les attributs d’affichage.',
        invalidData:
            'Un(e) {0} en page {1} nécessite des valeurs dans les attributs d’affichage.',
        invalidQuestion:
            'Un(e) {0} nommé(e) `{1}` en page {2} nécessite une question dans la logique de test.',
        invalidConstant:
            'Une {0} en page {1} nécessite une constante dans la logique de test.',
        invalidFailure:
            'Un(e) {0} nommé(e) `{1}` en page {2} a un score d’échec supérieur au score d’omission ou zéro dans la logique de test.',
        invalidFormula:
            'Un(e) {0} on page {1} nécessite une formule dans les attributs d’affichage.',
        invalidImageFile:
            'Un(e) {0} en page {1} nécessite un fichier image dans les attributs d’affichage.',
        invalidName: 'Un(e) {0} nommé(e) `{1}` on page {2} a un nom invalide.',
        invalidShape:
            'Un(e) {0} nommé(e) `{1}` en page {2} nécessite une forme dans les attributs d’affichage.',
        invalidSolution:
            'Un(e) {0} nommé(e) `{1}` en page {2} nécessite une solution dans la logique de test.',
        invalidStyle:
            'Un(e) {0} en page {1} a un style invalide dans les attributs d’affichage.',
        invalidSuccess:
            'Un(e) {0} nommé(e) `{1}` en page {2} a un score de succès inférieur au score d’omission ou zéro dans la logique de test.',
        invalidText:
            'Un(e) {0} en page {1} nécessite un texte dans les attributs d’affichage.',
        invalidValidation:
            'Un(e) {0} nommé(e) `{1}` en page {2} nécessite une formule de validation dans la logique de test.',
        invalidVideoFile:
            'Un(e) {0} en page {1} nécessite un fichier mp4 dans les attributs d’affichage.'
    },

    // audio
    audio: {
        description: 'Lecteur Audio',
        help: 'TODO',
        icon: 'box_surprise',
        name: 'Lecteur Audio',
        attributes: {
            autoplay: { title: 'Auto.' },
            mp3: { title: 'Fichier MP3' },
            ogg: { title: 'Fichier OGG' }
        }
    },

    // chargrid
    chargrid: {
        description: 'Character Grid',
        help: 'TODO',
        icon: 'box_surprise',
        name: 'Character Grid',
        attributes: {
            blank: { title: 'Vide' },
            // blankFill = gridStroke
            columns: { title: 'Colonnes' },
            fontColor: { title: 'Couleur Police' },
            gridFill: { title: 'Fond de Grille' },
            gridStroke: { title: 'Contour de Grille' },
            layout: { title: 'Mise en Page' },
            // lockedColor = valueColor = fontColor,
            lockedFill: { title: 'Fond Vérouillé' },
            rows: { title: 'Lignes' },
            selectedFill: { title: 'Fond Sélectionné' },
            whitelist: { title: 'Caractères' }
        },
        properties: {
            name: { title: 'Nom' },
            question: {
                help:
                    'Entrez la question à afficher dans les rapports de correction',
                title: 'Question'
            },
            solution: {
                help:
                    'Entrez la solution à afficher dans les rapports de correction',
                title: 'Solution'
            },
            validation: { title: 'Validation' },
            success: { title: 'Succès' },
            failure: { title: 'Échec' },
            omit: { title: 'Omission' }
        }
    },

    // chart
    chart: {
        description: 'Diagramme',
        help: 'TODO',
        icon: 'box_surprise',
        name: 'Diagramme',
        attributes: {
            categories: { title: 'Catégories' },
            data: { title: 'Données' },
            legend: { title: 'Légende' },
            style: { title: 'Style' },
            title: { title: 'Titre' },
            type: { title: 'Type' },
            values: { title: 'Valeurs' }
        }
    },

    // connector
    connector: {
        description: 'Connecteur',
        help: 'TODO',
        icon: 'box_surprise',
        name: 'Connecteur',
        attributes: {
            color: { title: 'Couleur' }
        },
        properties: {
            name: { title: 'Nom' },
            question: {
                help:
                    'Entrez la question à afficher dans les rapports de correction',
                title: 'Question'
            },
            solution: {
                help:
                    'Entrez la solution à afficher dans les rapports de correction',
                title: 'Solution'
            },
            validation: { title: 'Validation' },
            success: { title: 'Succès' },
            failure: { title: 'Échec' },
            omit: { title: 'Omission' },
            disabled: { title: 'Désactivé' }
        }
    },

    // dropzone
    dropzone: {
        description: 'Zone de Dépot',
        help: 'TODO',
        icon: 'box_surprise',
        name: 'Zone de Dépot',
        attributes: {
            center: {
                defaultValue: false, // TODO
                title: 'Centrer'
            },
            empty: { title: 'Vide' },
            style: { title: 'Style' },
            text: {
                defaultValue: 'Veuillez déposer ici.',
                title: 'Texte'
            }
        },
        properties: {
            name: { title: 'Nom' },
            question: {
                help:
                    'Entrez la question à afficher dans les rapports de correction',
                title: 'Question'
            },
            solution: {
                help:
                    'Entrez la solution à afficher dans les rapports de correction',
                title: 'Solution'
            },
            validation: { title: 'Validation' },
            success: { title: 'Succès' },
            failure: { title: 'Échec' },
            omit: { title: 'Omission' },
            disabled: { title: 'Désactivé' }
        }
    },

    // highlighter
    highlighter: {
        description: 'Surligneur',
        help: 'TODO',
        icon: 'box_surprise',
        name: 'Surligneur',
        attributes: {
            highlightStyle: { title: 'Surligne' },
            split: { title: 'Césure' },
            style: { title: 'Style' },
            text: {
                defaultValue: 'Un peu de texte à surligner.',
                title: 'Texte'
            }
        },
        properties: {
            name: { title: 'Nom' },
            question: {
                help:
                    'Entrez la question à afficher dans les rapports de correction',
                title: 'Question'
            },
            solution: {
                help:
                    'Entrez la solution à afficher dans les rapports de correction',
                title: 'Solution'
            },
            validation: { title: 'Validation' },
            success: { title: 'Succès' },
            failure: { title: 'Échec' },
            omit: { title: 'Omission' }
        }
    },

    // image
    image: {
        description: 'Image',
        help: 'TODO',
        icon: 'painting_landscape',
        name: 'Image',
        attributes: {
            alt: {
                defaultValue: 'Image',
                help: 'Entrez la description pour les malvoyants',
                title: 'Texte'
            },
            src: {
                defaultValue:
                    'cdn://images/o_collection/svg/office/painting_landscape.svg',
                help: 'Sélectionnez une image',
                title: 'Source'
            },
            style: { title: 'Style' }
        },
        properties: {
            behavior: {
                source: [
                    { text: 'Aucun', value: 'none' },
                    { text: 'Glissable', value: 'draggable' },
                    { text: 'Sélectionnable', value: 'selectable' }
                ],
                title: 'Comportement'
            },
            constant: { title: 'Constante' }
        }
    },

    // imageset
    imageset: {
        description: 'Jeu d’images',
        help: 'TODO',
        icon: 'box_surprise',
        name: 'Jeu d’images',
        attributes: {
            data: {
                defaultValue: [
                    {
                        text: 'Jeu d’images',
                        image: 'cdn://images/o_collection/svg/office/photos.svg'
                    }
                ],
                title: 'Images'
            },
            style: { title: 'Style' }
        },
        properties: {
            name: { title: 'Nom' },
            question: {
                help:
                    'Entrez la question à afficher dans les rapports de correction',
                title: 'Question'
            },
            solution: {
                help:
                    'Entrez la solution à afficher dans les rapports de correction',
                title: 'Solution'
            },
            validation: { title: 'Validation' },
            success: { title: 'Succès' },
            failure: { title: 'Échec' },
            omit: { title: 'Omission' }
        }
    },

    // label
    label: {
        description: 'Étiquette',
        help: 'TODO',
        icon: 'font',
        name: 'Étiquette',
        attributes: {
            style: { title: 'Style' },
            text: {
                defaultValue: 'Texte',
                help: 'Entrez le texte de l´étiquette',
                title: 'Texte'
            }
        },
        properties: {
            behavior: {
                source: [
                    { text: 'Aucun', value: 'none' },
                    { text: 'Glissable', value: 'draggable' },
                    { text: 'Sélectionnable', value: 'selectable' }
                ],
                title: 'Comportement'
            },
            constant: { title: 'Constante' }
        }
    },

    // latex
    latex: {
        description: 'Expression Mathématique',
        help: 'TODO',
        icon: 'box_surprise',
        name: 'Expression Mathématique',
        attributes: {
            formula: {
                defaultValue: '\\sum_{n=1}^{\\infty}2^{-n}=1',
                title: 'Formule'
            },
            inline: {
                defaultValue: false, // TODO
                title: 'Aligné'
            },
            style: { title: 'Style' }
        },
        properties: {
            behavior: {
                source: [
                    { text: 'Aucun', value: 'none' },
                    { text: 'Glissable', value: 'draggable' },
                    { text: 'Sélectionnable', value: 'selectable' }
                ],
                title: 'Comportement'
            },
            constant: { title: 'Constante' }
        }
    },

    // line
    // TODO
    line: {
        description: 'Line',
        help: 'TODO',
        icon: 'box_surprise',
        name: 'Line',
        attributes: {},
        properties: {}
    },

    // mathinput
    // TODO
    mathinput: {
        description: 'Math input',
        help: 'TODO',
        icon: 'box_surprise',
        name: 'Mat input',
        attributes: {},
        properties: {}
    },

    // multiquiz
    multiquiz: {
        description: 'Question à Choix Multiple',
        help: 'TODO',
        icon: 'box_surprise',
        name: 'Question à Choix Multiple',
        attributes: {
            data: {
                defaultValue: [
                    {
                        text: 'Option 1',
                        image:
                            'cdn://images/o_collection/svg/office/hand_count_one.svg'
                    },
                    {
                        text: 'Option 2',
                        image:
                            'cdn://images/o_collection/svg/office/hand_point_up.svg'
                    }
                ],
                help: 'Entrez les réponses possibles',
                title: 'Valeurs'
            },
            groupStyle: { title: 'Style Groupe' },
            itemStyle: { title: 'Style Element' },
            mode: {
                help: 'Choisissez un mode d´affichage',
                source: [
                    { text: 'Bouton', value: 'button' },
                    { text: 'Case à cocher', value: 'checkbox' },
                    { text: 'Image', value: 'image' },
                    { text: 'Lien', value: 'link' },
                    { text: 'Multisélection', value: 'multiselect' }
                ],
                title: 'Mode'
            },
            selectedStyle: { title: 'Style Sélection' },
            shuffle: { title: 'Mélanger' }
        },
        properties: {
            name: { title: 'Nom' },
            question: {
                help:
                    'Entrez la question à afficher dans les rapports de correction',
                title: 'Question'
            },
            solution: {
                help:
                    'Entrez la solution à afficher dans les rapports de correction',
                title: 'Solution'
            },
            validation: { title: 'Validation' },
            success: { title: 'Succès' },
            failure: { title: 'Échec' },
            omit: { title: 'Omission' }
        }
    },

    // numericbox
    numericbox: {
        description: 'Saisie de nombre',
        help: 'TODO',
        icon: 'box_surprise',
        name: 'Saisie de nombre',
        attributes: {
            decimals: { title: 'Décimales' },
            min: { title: 'Minimum' },
            max: { title: 'Maximum' },
            style: { title: 'Style' }
        },
        properties: {
            name: { title: 'Nom' },
            question: {
                help:
                    'Entrez la question à afficher dans les rapports de correction',
                title: 'Question'
            },
            solution: {
                help:
                    'Entrez la solution à afficher dans les rapports de correction',
                title: 'Solution'
            },
            validation: { title: 'Validation' },
            success: { title: 'Succès' },
            failure: { title: 'Échec' },
            omit: { title: 'Omission' }
        }
    },

    // pointer
    pointer: {
        description: 'Pointeur',
        help: 'TODO',
        icon: 'mouse_pointer',
        name: 'Pointeur'
    },

    // quiz
    quiz: {
        description: 'Question à Choix Unique',
        help: 'TODO',
        icon: 'radio_button_group',
        name: 'Question à Choix Unique',
        attributes: {
            data: {
                defaultValue: [
                    {
                        text: 'Vrai',
                        image: 'cdn://images/o_collection/svg/office/ok.svg'
                    },
                    {
                        text: 'Faux',
                        image: 'cdn://images/o_collection/svg/office/error.svg'
                    }
                ],
                help: 'Entrez les réponses possibles',
                title: 'Valeurs'
            },
            groupStyle: { title: 'Style Groupe' },
            itemStyle: { title: 'Style Element' },
            mode: {
                help: 'Choisissez un mode d´affichage',
                source: [
                    { text: 'Bouton', value: 'button' },
                    { text: 'Liste déroulante', value: 'dropdown' },
                    { text: 'Image', value: 'image' },
                    { text: 'Lien', value: 'link' },
                    { text: 'Option', value: 'radio' }
                ],
                title: 'Mode'
            },
            selectedStyle: { title: 'Style Sélection' },
            shuffle: { title: 'Mélanger' }
        },
        properties: {
            name: { title: 'Nom' },
            question: {
                help:
                    'Entrez la question à afficher dans les rapports de correction',
                title: 'Question'
            },
            solution: {
                help:
                    'Entrez la solution à afficher dans les rapports de correction',
                title: 'Solution'
            },
            validation: { title: 'Validation' },
            success: { title: 'Succès' },
            failure: { title: 'Échec' },
            omit: { title: 'Omission' }
        }
    },

    // selector
    selector: {
        description: 'Sélecteur',
        help: 'TODO',
        icon: 'box_surprise',
        name: 'Sélecteur',
        attributes: {
            color: { title: 'Couleur' },
            shape: {
                source: [
                    { text: 'Cercle', value: 'circle' },
                    { text: 'Croix', value: 'cross' },
                    { text: 'Rectangle', value: 'rect' }
                ],
                title: 'Forme'
            }
        },
        properties: {
            name: { title: 'Nom' },
            question: {
                help:
                    'Entrez la question à afficher dans les rapports de correction',
                title: 'Question'
            },
            solution: {
                help:
                    'Entrez la solution à afficher dans les rapports de correction',
                title: 'Solution'
            },
            validation: { title: 'Validation' },
            success: { title: 'Succès' },
            failure: { title: 'Échec' },
            omit: { title: 'Omission' },
            disabled: { title: 'Désactivé' }
        }
    },

    // table
    table: {
        description: 'Table',
        help: 'TODO',
        icon: 'table',
        name: 'Table',
        attributes: {
            columns: { title: 'Colonnes' },
            data: { title: 'Données' },
            rows: { title: 'Lignes' }
        }
    },

    // textarea
    textarea: {
        description: 'Saisie de texte long',
        help: 'TODO',
        icon: 'box_surprise',
        name: 'Saisie de texte long',
        attributes: {
            style: { title: 'Style' }
        },
        properties: {
            name: { title: 'Nom' },
            question: {
                help:
                    'Entrez la question à afficher dans les rapports de correction',
                title: 'Question'
            },
            solution: {
                help:
                    'Entrez la solution à afficher dans les rapports de correction',
                title: 'Solution'
            },
            validation: { title: 'Validation' },
            success: { title: 'Succès' },
            failure: { title: 'Échec' },
            omit: { title: 'Omission' },
            disabled: { title: 'Désactivé' }
            // disabled: { title: 'Désactivé' }
        }
    },

    // textbox
    textbox: {
        description: 'Saisie de Texte court',
        help: 'TODO',
        icon: 'text_field',
        name: 'Saisie de Texte court',
        attributes: {
            mask: {
                // TODO: Add help
                title: 'Masque'
            },
            style: { title: 'Style' }
        },
        properties: {
            name: { title: 'Nom' },
            question: {
                help:
                    'Entrez la question à afficher dans les rapports de correction',
                title: 'Question'
            },
            solution: {
                help:
                    'Entrez la solution à afficher dans les rapports de correction',
                title: 'Solution'
            },
            validation: { title: 'Validation' },
            success: { title: 'Succès' },
            failure: { title: 'Échec' },
            omit: { title: 'Omission' },
            disabled: { title: 'Désactivé' }
            // disabled: { title: 'Désactivé' }
        }
    },

    // textgaps
    textgaps: {
        description: 'Texte à trous',
        help: 'TODO',
        icon: 'box_surprise',
        name: 'Texte à trous',
        attributes: {
            inputStyle: { title: 'Style saisie' },
            style: { title: 'Style' },
            text: {
                title: 'Texte',
                defaultValue:
                    'Un peu de texte avec un trou comme [] ou [] à remplir.'
            }
        },
        properties: {
            name: { title: 'Nom' },
            question: {
                help:
                    'Entrez la question à afficher dans les rapports de correction',
                title: 'Question'
            },
            solution: {
                help:
                    'Entrez la solution à afficher dans les rapports de correction',
                title: 'Solution'
            },
            validation: { title: 'Validation' },
            success: { title: 'Succès' },
            failure: { title: 'Échec' },
            omit: { title: 'Omission' },
            disabled: { title: 'Désactivé' }
            // disabled: { title: 'Désactivé' }
        }
    },

    // variable
    // TODO
    variable: {
        description: 'Variable',
        help: 'TODO',
        icon: 'magic_wand',
        name: 'Variable',
        attributes: {},
        properties: {}
    },

    // video
    video: {
        description: 'Lecteur Vidéo',
        help: 'TODO',
        icon: 'box_surprise',
        name: 'Lecteur Vidéo',
        attributes: {
            autoplay: { title: 'Auto.' },
            mp4: { title: 'Fichier MP4' },
            ogv: { title: 'Fichier OGV' },
            toolbarHeight: { title: 'Haut. Commandes' }, // TODO: Make style
            wbem: { title: 'Fichier WBEM' }
        }
    }
};

/**
 * Default export
 */
export default res;
