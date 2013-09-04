/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var constants = {
    'zaehlerId': 'ZAEHLER_ID',
    'zaehlerStandId': 'ZAEHLER_STAND_ID',
    'zaehlerKategorieId': 'ZAEHLER_KATEGORIE_ID'
};

var sql = {
    'zaehlerstandUebersicht': '\
        SELECT \
            Z.ID AS ZAEHLER_ID,  \
            ZS.ID AS ZAEHLER_STAND_ID, \
            ZS.STAND AS ZAEHLER_STAND_STAND, \
            ZS.ABLESUNG AS ZAEHLER_STAND_ABLESUNG, \
            ZS.NOTIZ AS ZAEHLER_STAND_NOTIZ, \
            ZA.NAME AS ZAEHLER_ART_NAME, \
            ZA.EINHEIT AS ZAEHLER_ART_EINHEIT \
        FROM \
            ZAEHLER Z \
            INNER JOIN ZAEHLER_ART ZA ON Z.ZAEHLER_ART_ID = ZA.ID \
            LEFT JOIN ZAEHLER_STAND ZS ON Z.ID = ZS.ZAEHLER_ID \
        WHERE \
            ZAEHLER_ID = ? \
        ORDER BY ZAEHLER_STAND_ID DESC',            
    'zaehlerUebersicht': '\
        SELECT \
            Z.ID AS ZAEHLER_ID, \
            Z.NAME AS ZAEHLER_NAME, \
            ZA.NAME AS ZAEHLER_ART_NAME, \
            ZA.EINHEIT AS ZAEHLER_ART_EINHEIT, \
            ZA.GRAFIK AS ZAEHLER_ART_GRAFIK, \
            ZK.ID AS ZAEHLER_KATEGORIE_ID, \
            ZK.NAME AS ZAEHLER_KATEGORIE_NAME, \
            (SELECT COUNT(*) FROM ZAEHLER Z_TEMP WHERE Z_TEMP.ZAEHLER_KATEGORIE_ID = ZK.ID) AS ZAEHLER_KATEGORIE_ANZAHL, \
            MAX(ZS.STAND) AS ZAEHLER_STAND_STAND, \
            MAX(ZS.ABLESUNG) AS ZAEHLER_STAND_ABLESUNG \
        FROM \
            ZAEHLER Z \
            INNER JOIN ZAEHLER_ART ZA ON Z.ZAEHLER_ART_ID = ZA.ID \
            INNER JOIN ZAEHLER_KATEGORIE ZK ON Z.ZAEHLER_KATEGORIE_ID = ZK.ID \
            LEFT JOIN ZAEHLER_STAND ZS ON Z.ID = ZS.ZAEHLER_ID \
        GROUP BY ZAEHLER_ID \
        ORDER BY ZAEHLER_KATEGORIE_NAME'
};

var app = {
    
    // Application Constructor
    initialize: function() {
        numeral.language('de');
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);

        // ZAEHLER_UEBERSICHT **************************************************

        $('#zaehler_uebersicht').on('pageinit', function(event) {
            $('#testdatenZuruecksetzen').on('vclick', function() {
                var database = new Database();
                function onInitializeSucess() {
                    $.getJSON('data-test.json', function(data) {
                        database.importData(data, function() {
                            $('#zaehler_uebersicht_menu').panel('close');
                            db.retriev_zaehler_uebersicht();
                        });
                    });
                }
                database.initialize(onInitializeSucess);
            });
        });

        $('#zaehler_uebersicht').on('pagebeforeshow',function(event, ui) {
            db.retriev_zaehler_uebersicht();
        });

        // ZAEHLER_ANLEGEN *****************************************************

        $('#zaehler_anlegen').on('pageinit', function(event) {
            $('#zaehler_anlegen_speichern').on('vclick',function(event) {
                db.save_zaehler();
            });
        });

        $('#zaehler_anlegen').on('pagebeforeshow',function(event, ui) {
            db.retriev_zaehlerart(
                $('#zaehler_anlegen_content_art'),
                $('#zaehler_anlegen_content_kategorie'));
        });

        // ZAEHLER_VERWALTEN ***************************************************

        $('#zaehler_verwalten').on('pageinit', function(event) {
            $('#zaehler_verwalten_speichern').on('vclick',function(event) {
                db.update_zaehler();
            });
            $('#zaehler_verwalten_loeschen').on('vclick',function(event) {
                db.delete_zaehler();
            });
        });

        $('#zaehler_verwalten').on('pagebeforeshow',function(event, ui) {
            db.retriev_zaehlerart(
                $('#zaehler_verwalten_content_art'),
                $('#zaehler_verwalten_content_kategorie'));
            db.retriev_zaehler();
        });

        // ZAEHLERSTAND_ERFASSEN ***********************************************

        $('#zaehlerstand_erfassen').on('pageinit', function(event) {
            $('#zaehlerstand_erfassen_speichern').on('vclick',function(event) {
                db.save_zaehlerstand(function() {
                    db.retriev_zaehlerstand_uebersicht();
                });
            });
        });

        $('#zaehlerstand_erfassen').on('pagebeforeshow',function(event, ui) {
            $('#ablesung_am').val(new Date().toString('yyyy-MM-dd'));
            $('#ablesung_um').val(new Date().toString('HH:mm:ss'));
        });

        // ZAEHLERSTAND_BEARBEITEN *********************************************

        $('#zaehlerstand_bearbeiten').on('pageinit', function(event) {
            $('#zaehlerstand_bearbeiten_speichern').on('vclick',function(event) {
                db.update_zaehlerstand(function() {
                    db.retriev_zaehlerstand_uebersicht();
                });
            });
            $('#zaehlerstand_bearbeiten_loeschen').on('vclick',function(event) {
                db.delete_zaehlerstand(function() {
                    db.retriev_zaehlerstand_uebersicht();
                });
            });
        });

        $('#zaehlerstand_bearbeiten').on('pagebeforeshow',function(event, ui) {
            db.retriev_zaehlerstand();
        });
        
        // ZAEHLERSTAND_AUSWERTEN **********************************************



        // ZAEHLERKATEGORIE_UEBERSICHT *****************************************

        $('#zaehlerkategorie_uebersicht').on('pagebeforeshow',function(event, ui) {
            db.retriev_zaehlerkategorie_uebersicht();
        });

        // ZAEHLERKATEGORIE_ANLEGEN ********************************************

        $('#zaehlerkategorie_anlegen').on('pageinit', function(event) {
            $('#zaehlerkategorie_anlegen_speichern').on('vclick',function(event) {
                db.save_zaehlerkategorie();
            });
        });

        // ZAEHLERKATEGORIE_BEARBEITEN *****************************************

        $('#zaehlerkategorie_bearbeiten').on('pageinit', function(event) {
            $('#zaehlerkategorie_bearbeiten_speichern').on('vclick',function(event) {
                db.update_zaehlerkategorie();
            });
            $('#zaehlerkategorie_bearbeiten_loeschen').on('vclick',function(event) {
                db.delete_zaehlerkategorie();
            });
        });
        
        $('#zaehlerkategorie_bearbeiten').on('pagebeforeshow',function(event, ui) {
            db.retriev_zaehlerkategorie();
        });
    },
    
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
            
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.info('receivedEvent deviceready');

        var database = new Database();

        function onInitializeSucess() {
            console.info('Datenbank Initialisierung abgeschlossen!');
        }

        function onRetrieveVersionSucess(version) {
            console.info('Datenbank-Version: ' + version);
        }

        function onRetrieveVersionError() {
            console.info('Datenbank-Version konnte nicht ermittelt werden!');
            // Datenbank wird initialisiert
            database.initialize(onInitializeSucess);
        }

        database.retrieveVersion(onRetrieveVersionSucess, onRetrieveVersionError);
    }
};

var db = {
    // Datenbank öffnen
    open: function() {
        return window.openDatabase("VERBRAUCHERZAEHLER", "1.0", "Verbraucherzähler", 1000000);
    },

    retriev_zaehler_uebersicht: function() {

        var html = [];
        var i = 0;
        
        this.open().transaction(
            // callback
            function(tx) {
                tx.executeSql(sql.zaehlerUebersicht, [], function (tx, results) {
                    var len = results.rows.length;
                    if (len) {
                        var letzteZahlerKategorieId = -1;
//                        html[i++] = '<ul id="zaehler_uebersicht_listview" data-role="listview" data-inset="false" data-divider-theme="b" data-icon="gear">';
                        
                        for (var a = 0; a < len; a++){
                            var item = results.rows.item(a);
                            
                            if (letzteZahlerKategorieId !== item.ZAEHLER_KATEGORIE_ID) {
                                letzteZahlerKategorieId = item.ZAEHLER_KATEGORIE_ID;
                                html[i++] = '<li data-role="list-divider">';
                                html[i++] = item.ZAEHLER_KATEGORIE_NAME;
                                html[i++] = '<span class="ui-li-count" style="font-size: 14px;">';
                                html[i++] = item.ZAEHLER_KATEGORIE_ANZAHL;
                                html[i++] = '</span></li>';
                            }

                            var letzterZahlerStand = '';

                            if (item.ZAEHLER_STAND_STAND !== null && item.ZAEHLER_STAND_ABLESUNG !== null) {
                                var zaehlerStandStand = numeral(item.ZAEHLER_STAND_STAND).format('0,0.00');
                                var zaehlerStandAblesung = Date.parse(item.ZAEHLER_STAND_ABLESUNG).toString('dd.MM.yyyy');
                                var zaehlerArtEinheit = item.ZAEHLER_ART_EINHEIT;
                                letzterZahlerStand = zaehlerStandAblesung + ' - ' + zaehlerStandStand + ' ' +  zaehlerArtEinheit;
                            }

                            html[i++] = '<li><a name="zaehlerstand_uebersicht" data-transition="slide" data-identity="';
                            html[i++] = item.ZAEHLER_ID;
                            html[i++] = '" style="padding-right: 15px;"><h2 style="color: #33B5E5;"><strong>';
                            html[i++] = item.ZAEHLER_ART_NAME;
                            html[i++] = '</strong><i class="icon-';
                            html[i++] = item.ZAEHLER_ART_GRAFIK;
                            html[i++] = '" style="display: inline-block; padding-left: 10px;"></i></h2><p><span style="font-style: italic">Nr. ';
                            html[i++] = item.ZAEHLER_NAME;
                            html[i++] = '</span></p><p>';
                            html[i++] = letzterZahlerStand;
                            html[i++] = '</p><a href="#zaehler_verwalten" data-transition="flip" data-identity="';
                            html[i++] = item.ZAEHLER_ID;
                            html[i++] = '" name="zaehler_verwalten" style="border-left: 1px solid rgba(0,0,0,0.1);">Zähler bearbeiten</a></a></li>';
                        }
                        
//                        html[i++] = '</ul>';
                    }
                });
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                var $listview = $('#zaehler_uebersicht_listview');
                $listview.html(html.join(''));
                $listview.listview('refresh');
                var $links = $listview.find('a');
                $links.off().on("vclick", function(){
                    var zaehlerId = $(this).data("identity");
                    window.localStorage.setItem(constants.zaehlerId, zaehlerId);
                    var linkName = $(this).attr('name');
                    if (linkName === "zaehlerstand_uebersicht") {
                        db.retriev_zaehlerstand_uebersicht();
                    }
                });
            }
        );
    },

    retriev_zaehlerstand_uebersicht: function() {
        
        var html = [];
        var i = 0;
        
        this.open().transaction(
            // callback
            function(tx) {

                var zaehlerId = window.localStorage.getItem(constants.zaehlerId);

                tx.executeSql(sql.zaehlerstandUebersicht,[zaehlerId], function (tx, results) {
                    var len = results.rows.length;
                    if (len) {
                        html[i++] = '<ul id="zaehlerstand_uebersicht_listview" data-role="listview" data-inset="true" data-divider-theme="b" data-icon="gear">';

                        for (var a = 0; a < len; a++){
                            var item = results.rows.item(a);

                            if (a === 0) {
                                html[i++] = '<li data-role="list-divider">';
                                html[i++] = item.ZAEHLER_ART_NAME;
                                html[i++] = '<span class="ui-li-count" style="font-size: 14px;">';
                                html[i++] = len;
                                html[i++] = '</span></li>';
                            }

                            html[i++] = '<li><a href="#zaehlerstand_bearbeiten" data-transition="flip" data-identity="';
                            html[i++] = item.ZAEHLER_STAND_ID;
                            html[i++] = '" style="padding-right: 15px;">';
                            html[i++] = '<h2><strong>';
                            html[i++] = Date.parse(item.ZAEHLER_STAND_ABLESUNG).toString('dd.MM.yyyy HH:mm');
                            html[i++] = ' Uhr</strong></h2>';
                            html[i++] = '<p><span style="font-style: italic">';
                            html[i++] = item.ZAEHLER_STAND_NOTIZ;
                            html[i++] = '</span></p><p>';
                            html[i++] = numeral(item.ZAEHLER_STAND_STAND).format('0,0.00');
                            html[i++] = ' ';
                            html[i++] = item.ZAEHLER_ART_EINHEIT;
                            html[i++] = '</p><p class="ui-li-aside"></p></a></li>';
                        }
                        
                        html[i++] = '</ul>';
                    }
                });
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                var $page = $('#zaehlerstand_uebersicht');
                var $content = $page.children(':jqmData(role=content)');
                $content.html(html.join(''));                
                $page.page();
                var $listview = $content.children(':jqmData(role=listview)');
                $listview.listview();
                $listview.find('a').off().on("vclick", function(){
                    var zaehlerStandId = $(this).data("identity");
                    window.localStorage.setItem(constants.zaehlerStandId, zaehlerStandId);
                });
                $.mobile.changePage('#zaehlerstand_uebersicht', {transition: "slide"});
            }
        );
    },

    retriev_zaehlerart: function(selectElement, selectZaehlerKategorieElement) {
        this.open().transaction(
            // callback
            function(tx) {

                var sql ='\
                    SELECT \
                        ID, \
                        NAME \
                    FROM \
                        ZAEHLER_ART \
                    ORDER BY NAME';

                tx.executeSql(sql,[], function (tx, results) {
                    var len = results.rows.length;
                    if (len) {
                        selectElement.find('option').remove();
                        for (var i = 0; i < len; i++) {
                            var item = results.rows.item(i);
                            if (i == 0) {
                                selectElement.append('<option value="null">Bitte Z&auml;hlerart ausw&auml;hlen</option>');
                            }
                            selectElement.append('<option value="' + item.ID + '">' + item.NAME + '</option>');
                        }
                    }
                });
                
                tx.executeSql('SELECT ID, NAME FROM ZAEHLER_KATEGORIE ORDER BY NAME',[], function (tx, results) {
                    var len = results.rows.length;
                    if (len) {
                        selectZaehlerKategorieElement.find('option').remove();
                        for (var i = 0; i < len; i++) {
                            var item = results.rows.item(i);
                            if (i == 0) {
                                selectZaehlerKategorieElement.append('<option value="null">Bitte Zählerkategorie ausw&auml;hlen</option>');
                            }
                            selectZaehlerKategorieElement.append('<option value="' + item.ID + '">' + item.NAME + '</option>');
                        }
                    }
                });
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                console.info("Success processing SQL!");
                selectElement.selectmenu('refresh');
                selectZaehlerKategorieElement.selectmenu('refresh');
            }
        );
    },

    retriev_zaehler: function() {
        this.open().transaction(
            // callback
            function(tx) {

                var sql ='\
                    SELECT \
                        ZAEHLER_ART_ID, \
                        ZAEHLER_KATEGORIE_ID, \
                        NAME \
                    FROM \
                        ZAEHLER \
                    WHERE  \
                        ID = ?';

                var zaehlerId = window.localStorage.getItem(constants.zaehlerId);

                tx.executeSql(sql,[zaehlerId], function (tx, results) {
                    var item = results.rows.item(0);
                    $('#zaehler_verwalten_content_art').val(item.ZAEHLER_ART_ID).selectmenu('refresh');
                    $('#zaehler_verwalten_content_kategorie').val(item.ZAEHLER_KATEGORIE_ID).selectmenu('refresh');
                    $('#zaehler_verwalten_content_name').val(item.NAME);
                });
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                console.info("Success processing SQL!");
            }
        );
    },

    save_zaehler: function() {
        this.open().transaction(
            // callback
            function(tx) {

                var art = $('#zaehler_anlegen_content_art').val();
                var kategorie = $('#zaehler_anlegen_content_kategorie').val();
                var name = $('#zaehler_anlegen_content_name').val();

                tx.executeSql("INSERT INTO ZAEHLER (ZAEHLER_ART_ID, ZAEHLER_KATEGORIE_ID, NAME) VALUES (?, ?, ?)", [art, kategorie, name]);
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                console.info("Success processing SQL!");
            }
        );
    },

    update_zaehler: function() {
        this.open().transaction(
            // callback
            function(tx) {

                var zaehlerId = window.localStorage.getItem(constants.zaehlerId);
                var artId = $('#zaehler_verwalten_content_art').val();
                var kategorieId = $('#zaehler_verwalten_content_kategorie').val();
                var name = $('#zaehler_verwalten_content_name').val();

                tx.executeSql("UPDATE ZAEHLER SET ZAEHLER_ART_ID = ?, ZAEHLER_KATEGORIE_ID = ?, NAME = ? WHERE ID = ?", [artId, kategorieId, name, zaehlerId]);
            }
        );
    },

    delete_zaehler: function() {
        this.open().transaction(
            // callback
            function(tx) {
                var zaehlerId = window.localStorage.getItem(constants.zaehlerId);
                tx.executeSql("DELETE FROM ZAEHLER_STAND WHERE ZAEHLER_ID = ?", [zaehlerId]);
                tx.executeSql("DELETE FROM ZAEHLER WHERE ID = ?", [zaehlerId]);
            }
        );
    },

    save_zaehlerstand: function(successCallback) {
        this.open().transaction(
            // callback
            function(tx) {

                var zaehlerId = window.localStorage.getItem(constants.zaehlerId);
                var ablesung_am = $('#zaehlerstand_erfassen_content #ablesung_am').val();
                var ablesung_um = $('#zaehlerstand_erfassen_content #ablesung_um').val();
                var ablesung = ablesung_am + 'T' + ablesung_um;
                var stand = $('#zaehlerstand_erfassen_content #stand').val();
                var notiz = $('#zaehlerstand_erfassen_content #notiz').val();

                tx.executeSql("INSERT INTO ZAEHLER_STAND (ZAEHLER_ID, ABLESUNG, STAND, NOTIZ) VALUES (?, ?, ?, ?)", [zaehlerId, ablesung, stand, notiz]);
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                $('#zaehlerstand_erfassen_content #ablesung').val('');
                $('#zaehlerstand_erfassen_content #stand').val('');
                $('#zaehlerstand_erfassen_content #notiz').val('');
                successCallback.call(this);
            }
        );
    },

    update_zaehlerstand: function(successCallback) {
        this.open().transaction(
            // callback
            function(tx) {

                var zaehlerStandId = window.localStorage.getItem(constants.zaehlerStandId);
                var ablesung_am = $('#zaehlerstand_bearbeiten_content_ablesung_am').val();
                var ablesung_um = $('#zaehlerstand_bearbeiten_content_ablesung_um').val();
                var ablesung = ablesung_am + 'T' + ablesung_um;
                var stand = $('#zaehlerstand_bearbeiten_content_stand').val();
                var notiz = $('#zaehlerstand_bearbeiten_content_notiz').val();

                tx.executeSql("UPDATE ZAEHLER_STAND SET ABLESUNG = ?, STAND = ?, NOTIZ = ? WHERE ID = ?", [ablesung, stand, notiz, zaehlerStandId]);
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                console.info("Success processing SQL!");
                successCallback.call(this);
            }
        );
    },

    delete_zaehlerstand: function(successCallback) {
        this.open().transaction(
            // callback
            function(tx) {
                var zaehlerStandId = window.localStorage.getItem(constants.zaehlerStandId);
                tx.executeSql("DELETE FROM ZAEHLER_STAND WHERE ID = ?", [zaehlerStandId]);
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                console.info("Success processing SQL!");
                successCallback.call(this);
            }
        );
    },

    retriev_zaehlerstand: function() {
        this.open().transaction(
            // callback
            function(tx) {

                var sql ='\
                    SELECT \
                        ABLESUNG, \
                        STAND, \
                        NOTIZ \
                    FROM \
                        ZAEHLER_STAND \
                    WHERE  \
                        ID = ?';

                var zaehlerStandId = window.localStorage.getItem(constants.zaehlerStandId);

                tx.executeSql(sql,[zaehlerStandId], function (tx, results) {
                    var item = results.rows.item(0);
                    var ablesung = Date.parse(item.ABLESUNG);
                    $('#zaehlerstand_bearbeiten_content_ablesung_am').val(ablesung.toString('yyyy-MM-dd'));
                    $('#zaehlerstand_bearbeiten_content_ablesung_um').val(ablesung.toString('HH:mm:ss'));
                    $('#zaehlerstand_bearbeiten_content_stand').val(item.STAND);
                    $('#zaehlerstand_bearbeiten_content_notiz').val(item.NOTIZ);
                });
            }
        );
    },

    retriev_zaehlerkategorie_uebersicht: function() {
        this.open().transaction(

            // callback
            function(tx) {

                var sql ='\
                    SELECT \
                        ID, \
                        NAME, \
                        BESCHREIBUNG \
                    FROM \
                        ZAEHLER_KATEGORIE \
                    ORDER BY NAME';

                tx.executeSql(sql,[], function (tx, results) {
                    var listview = $("#zaehlerkategorie_uebersicht_listview");
                    var len = results.rows.length;

                    listview.children('li').remove();

                    if (len) {
                        for (var i = 0; i < len; i++){
                            var item = results.rows.item(i);

                            if (i == 0) {
                                listview.append('<li data-role="list-divider">Kategorien<span class="ui-li-count" style="font-size: 14px;">' + len + '</span></li>');
                            }

                            listview.append('\
                                <li><a href="#zaehlerkategorie_bearbeiten" data-transition="flip" data-identity="' + item.ID + '" style="padding-right: 15px;">\
                                    <h2><strong>' + item.NAME + '</strong></h2>\
                                    <p>' + item.BESCHREIBUNG + '</p>\
                                </a></li>');
                        }
                    }
                });
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                var listview = $("#zaehlerkategorie_uebersicht_listview");
                var listviewLinks = listview.find('a');
                listview.listview('refresh');
                listviewLinks.off();
                listviewLinks.on("click", function(event){
                    var zaehlerKategorieId = $(this).data("identity");
                    window.localStorage.setItem(constants.zaehlerKategorieId, zaehlerKategorieId);
                });
            }
        );
    },

    save_zaehlerkategorie: function() {
        this.open().transaction(
            // callback
            function(tx) {

                var name = $('#zaehlerkategorie_anlegen_name').val();
                var beschreibung = $('#zaehlerkategorie_anlegen_beschreibung').val();

                tx.executeSql("INSERT INTO ZAEHLER_KATEGORIE (NAME, BESCHREIBUNG) VALUES (?, ?)", [name, beschreibung]);
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                $('#zaehlerkategorie_anlegen_name').val('');
                $('#zaehlerkategorie_anlegen_beschreibung').val('');
            }
        );
    },
    
    delete_zaehlerkategorie: function() {
        this.open().transaction(
            // callback
            function(tx) {
                var sql ='\
                    SELECT \
                        COUNT(Z.ZAEHLER_KATEGORIE_ID) AS ANZAHL_ZUGEORDNETE_ZAEHLER, \
                        ZK.NAME AS ZAEHLER_KATEGORIE_NAME \
                    FROM \
                        ZAEHLER_KATEGORIE ZK \
                        LEFT JOIN ZAEHLER Z ON Z.ZAEHLER_KATEGORIE_ID = ZK.ID \
                    WHERE \
                        ZK.ID = ? \
                    GROUP BY ZK.NAME';

                var zaehlerKategorieId = window.localStorage.getItem(constants.zaehlerKategorieId);

                tx.executeSql(sql,[zaehlerKategorieId], function (tx, results) {
                    var item = results.rows.item(0);
                    var anzahlZugeordneteZaehler = item.ANZAHL_ZUGEORDNETE_ZAEHLER;
                    if (anzahlZugeordneteZaehler > 0) {
                        navigator.notification.alert(
                            'Die Kategorie "' + item.ZAEHLER_KATEGORIE_NAME + '" kann nicht gelöscht werden! Es sind aktuell noch ' + anzahlZugeordneteZaehler + ' Zähler zugeordnet.', // message
                            function() {}, // callback
                            'Hinweis', // title
                            'Schließen' // buttonName
                        );
                    } else {
                       tx.executeSql("DELETE FROM ZAEHLER_KATEGORIE WHERE ID = ?", [zaehlerKategorieId]);
                       $.mobile.changePage('#zaehlerkategorie_uebersicht', { transition: "flip", reverse: true, changeHash: false });
                    }
                });
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                console.info("Success processing SQL!");
            }
        );
    },
    
    update_zaehlerkategorie: function() {
        this.open().transaction(
            // callback
            function(tx) {

                var zaehlerKategorieId = window.localStorage.getItem(constants.zaehlerKategorieId);
                var name = $('#zaehlerkategorie_bearbeiten_name').val();
                var beschreibung = $('#zaehlerkategorie_bearbeiten_beschreibung').val();

                tx.executeSql("UPDATE ZAEHLER_KATEGORIE SET NAME = ?, BESCHREIBUNG = ? WHERE ID = ?", [name, beschreibung, zaehlerKategorieId]);
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                console.info("Success processing SQL!");
            }
        );
    },
    
    retriev_zaehlerkategorie: function() {
        this.open().transaction(
            // callback
            function(tx) {

                var sql ='\
                    SELECT \
                        NAME, \
                        BESCHREIBUNG \
                    FROM \
                        ZAEHLER_KATEGORIE \
                    WHERE  \
                        ID = ?';

                var zaehlerKategorieId = window.localStorage.getItem(constants.zaehlerKategorieId);

                tx.executeSql(sql,[zaehlerKategorieId], function (tx, results) {
                    var item = results.rows.item(0);

                    $('#zaehlerkategorie_bearbeiten_name').val(item.NAME);
                    $('#zaehlerkategorie_bearbeiten_beschreibung').val(item.BESCHREIBUNG);
                });
            }
        );
    }
};