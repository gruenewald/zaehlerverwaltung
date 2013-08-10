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

var app = {
    // Application Constructor
    initialize: function() {
        numeral.language('de');
        this.bindEvents();
        db.init();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);

        // ZAEHLER_UEBERSICHT **************************************************

        $('zaehler_uebersicht').on('pageinit', function(event) {

        });

        $('#zaehler_uebersicht').on('pagebeforeshow',function(event, ui) {
            db.retriev_zaehler_uebersicht();
        });

        // ZAEHLERSTAND_UEBERSICHT *********************************************

        $('zaehlerstand_uebersicht').on('pageinit', function(event) {

        });

        $('#zaehlerstand_uebersicht').on('pagebeforeshow',function(event, ui) {
            db.retriev_zaehlerstand_uebersicht();
        });

        // ZAEHLER_ANLEGEN *****************************************************

        $('#zaehler_anlegen').on('pageinit', function(event) {
            $('#zaehler_anlegen_speichern').on('click',function(event) {
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
            $('#zaehler_verwalten_speichern').on('click',function(event) {
                db.update_zaehler();
            });
            $('#zaehler_verwalten_loeschen').on('click',function(event) {
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
            $('#zaehlerstand_erfassen_speichern').on('click',function(event) {
                db.save_zaehlerstand();
            });
        });

        $('#zaehlerstand_erfassen').on('pagebeforeshow',function(event, ui) {
            $('#ablesung_am').val(new Date().toString('yyyy-MM-dd'));
            $('#ablesung_um').val(new Date().toString('HH:mm:ss'));
        });

        // ZAEHLERSTAND_BEARBEITEN *********************************************

        $('#zaehlerstand_bearbeiten').on('pageinit', function(event) {
            $('#zaehlerstand_bearbeiten_speichern').on('click',function(event) {
                db.update_zaehlerstand();
            });
            $('#zaehlerstand_bearbeiten_loeschen').on('click',function(event) {
                db.delete_zaehlerstand();
            });
        });

        $('#zaehlerstand_bearbeiten').on('pagebeforeshow',function(event, ui) {
            db.retriev_zaehlerstand();
        });

        // ZAEHLERKATEGORIE_UEBERSICHT *****************************************

        $('#zaehlerkategorie_uebersicht').on('pagebeforeshow',function(event, ui) {
            db.retriev_zaehlerkategorie_uebersicht();
        });

        // ZAEHLERKATEGORIE_ANLEGEN ********************************************

        $('#zaehlerkategorie_anlegen').on('pageinit', function(event) {
            $('#zaehlerkategorie_anlegen_speichern').on('click',function(event) {
                db.save_zaehlerkategorie();
            });
        });

        // ZAEHLERKATEGORIE_BEARBEITEN *****************************************

        $('#zaehlerkategorie_bearbeiten').on('pageinit', function(event) {
            $('#zaehlerkategorie_bearbeiten_speichern').on('click',function(event) {
                db.update_zaehlerkategorie();
            });
            $('#zaehlerkategorie_bearbeiten_loeschen').on('click',function(event) {
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
        db.init();
    }
};

var db = {
    // Datenbank öffnen
    open: function() {
        return window.openDatabase("VERBRAUCHERZAEHLER", "1.0", "Verbraucherzähler", 1000000);
    },

    // Datenbank Initialisierung
    init: function() {
        var db = this.open();

        console.log(db.version);

        //db.changeVersion(db.version, "2", function () {console.log("foobar")});

        db.transaction(
            // callback
            function(tx) {

                tx.executeSql('DROP TABLE IF EXISTS ZAEHLER_ART');
                tx.executeSql('DROP TABLE IF EXISTS ZAEHLER_KATEGORIE');
                tx.executeSql('DROP TABLE IF EXISTS ZAEHLER');
                tx.executeSql('DROP TABLE IF EXISTS ZAEHLER_STAND');

                tx.executeSql('CREATE TABLE IF NOT EXISTS ZAEHLER_ART (ID INTEGER PRIMARY KEY AUTOINCREMENT, NAME TEXT, EINHEIT TEXT, GRAFIK TEXT)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS ZAEHLER_KATEGORIE (ID INTEGER PRIMARY KEY AUTOINCREMENT, NAME TEXT, BESCHREIBUNG TEXT)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS ZAEHLER (ID INTEGER PRIMARY KEY AUTOINCREMENT, ZAEHLER_ART_ID INTEGER, ZAEHLER_KATEGORIE_ID INTEGER, NAME TEXT)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS ZAEHLER_STAND (ID INTEGER PRIMARY KEY AUTOINCREMENT, ZAEHLER_ID INTEGER, ABLESUNG NUMERIC, STAND NUMERIC, NOTIZ TEXT)');

                // ZAEHLER_ART
                tx.executeSql('INSERT INTO ZAEHLER_ART (NAME, EINHEIT, GRAFIK) VALUES ("Strom", "kWh", "bolt")');
                tx.executeSql('INSERT INTO ZAEHLER_ART (NAME, EINHEIT, GRAFIK) VALUES ("Wasser", "m³", "umbrella")');
                tx.executeSql('INSERT INTO ZAEHLER_ART (NAME, EINHEIT, GRAFIK) VALUES ("Gas", "m³", "fire")');
                tx.executeSql('INSERT INTO ZAEHLER_ART (NAME, EINHEIT, GRAFIK) VALUES ("Heizöl", "Liter", "truck")');
                tx.executeSql('INSERT INTO ZAEHLER_ART (NAME, EINHEIT, GRAFIK) VALUES ("Nahwärme", "MWh", "sun")');
                tx.executeSql('INSERT INTO ZAEHLER_ART (NAME, EINHEIT, GRAFIK) VALUES ("Solarstrom", "kWh", "bolt")');
                tx.executeSql('INSERT INTO ZAEHLER_ART (NAME, EINHEIT, GRAFIK) VALUES ("Pellets", "t", "leaf")');

                // ZAEHLER_KATEGORIE
                tx.executeSql('INSERT INTO ZAEHLER_KATEGORIE (NAME, BESCHREIBUNG) VALUES ("Allgemein", "Standardkategorie")');

                // ZAEHLER
                tx.executeSql('INSERT INTO ZAEHLER (ZAEHLER_ART_ID, ZAEHLER_KATEGORIE_ID, NAME) VALUES (1, 1, "64781254")');
                tx.executeSql('INSERT INTO ZAEHLER (ZAEHLER_ART_ID, ZAEHLER_KATEGORIE_ID, NAME) VALUES (3, 1, "7885121456")');

                // ZAHLER_STAND
                tx.executeSql('INSERT INTO ZAEHLER_STAND (ZAEHLER_ID, ABLESUNG, STAND, NOTIZ) VALUES (1, datetime("2013-01-01T08:30:00"), 1245.46, "")');
                tx.executeSql('INSERT INTO ZAEHLER_STAND (ZAEHLER_ID, ABLESUNG, STAND, NOTIZ) VALUES (1, datetime("2013-02-04T10:00:00"), 1345.46, "Das ist eine Notiz2")');
                tx.executeSql('INSERT INTO ZAEHLER_STAND (ZAEHLER_ID, ABLESUNG, STAND, NOTIZ) VALUES (1, datetime("2013-02-28T23:00:50"), 1545.46, "")');
                tx.executeSql('INSERT INTO ZAEHLER_STAND (ZAEHLER_ID, ABLESUNG, STAND, NOTIZ) VALUES (1, datetime("2013-04-02T13:02:11"), 1645.46, "")');
                tx.executeSql('INSERT INTO ZAEHLER_STAND (ZAEHLER_ID, ABLESUNG, STAND, NOTIZ) VALUES (2, datetime("2013-05-12T13:02:11"), 334587.46, "Das ist nix.")');
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                console.info("Success processing SQL!");
            }
        );
    },

    retriev_zaehler_uebersicht: function() {
        this.open().transaction(
            // callback
            function(tx) {

                var sql = '\
                    SELECT \
                        Z.ID AS ZAEHLER_ID, \
                        Z.NAME AS ZAEHLER_NAME, \
                        ZA.NAME AS ZAEHLER_ART_NAME, \
                        ZA.EINHEIT AS ZAEHLER_ART_EINHEIT, \
                        ZA.GRAFIK AS ZAEHLER_ART_GRAFIK, \
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
                    ORDER BY ZAEHLER_KATEGORIE_NAME';

                tx.executeSql(sql, [], function (tx, results) {
                    $("#zaehler_uebersicht_listview li").remove();
                    var len = results.rows.length;
                    var listview = $("#zaehler_uebersicht_listview");

                    if (len) {
                        var letzteZahlerKategorie = '';
                        for (var i = 0; i < len; i++){
                            var item = results.rows.item(i);
                            
                            if (letzteZahlerKategorie !== item.ZAEHLER_KATEGORIE_NAME) {
                                letzteZahlerKategorie = item.ZAEHLER_KATEGORIE_NAME;
                                listview.append('<li data-role="list-divider">' + letzteZahlerKategorie + '<span class="ui-li-count" style="font-size: 14px;">' + item.ZAEHLER_KATEGORIE_ANZAHL + '</span></li>');
                            }

                            var letzterZahlerStand = '';

                            if (item.ZAEHLER_STAND_STAND != null && item.ZAEHLER_STAND_ABLESUNG != null) {
                                var zaehlerStandStand = zaehlerStandStand = numeral(item.ZAEHLER_STAND_STAND).format('0,0.00');
                                var zaehlerStandAblesung = Date.parse(item.ZAEHLER_STAND_ABLESUNG).toString('dd.MM.yyyy');
                                var zaehlerArtEinheit = item.ZAEHLER_ART_EINHEIT;
                                letzterZahlerStand = zaehlerStandAblesung + ' - ' + zaehlerStandStand + ' ' +  zaehlerArtEinheit;
                            }

                            listview.append('\
                                <li><a href="#zaehlerstand_uebersicht" data-transition="slide" data-identity="' + item.ZAEHLER_ID + '" style="padding-right: 15px;">\
                                    <h2 style="color: #33B5E5;"><strong>' + item.ZAEHLER_ART_NAME + '</strong><i class="icon-' + item.ZAEHLER_ART_GRAFIK + '" style="display: inline-block; padding-left: 10px;"></i></h2>\
                                    <p><span style="font-style: italic">Nr. ' + item.ZAEHLER_NAME + '</span></p>\
                                    <p>' + letzterZahlerStand + '</p>\
                                    <a href="#zaehler_verwalten" data-transition="flip" data-identity="' + item.ZAEHLER_ID + '" name="zaehler_verwalten" style="border-left: 1px solid rgba(0,0,0,0.1);">Zähler bearbeiten</a>\
                                </a></li>');
                        }
                    }
                });
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                $("#zaehler_uebersicht_listview").listview('refresh');
                $('#zaehler_uebersicht_listview a').off();
                $('#zaehler_uebersicht_listview a').on("click", function(event){
                    var zaehlerId = $(this).data("identity");
                    window.localStorage.setItem(constants.zaehlerId, zaehlerId);
                });
            }
        );
    },

    retriev_zaehlerstand_uebersicht: function() {
        this.open().transaction(
            // callback
            function(tx) {

                var zaehlerId = window.localStorage.getItem(constants.zaehlerId);
                var sql ='\
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
                    ORDER BY ZAEHLER_STAND_ID DESC';

                tx.executeSql(sql,[zaehlerId], function (tx, results) {
                    $("#zaehlerstand_uebersicht_listview li").remove();
                    var listview = $("#zaehlerstand_uebersicht_listview");
                    var len = results.rows.length;
                    if (len) {
                        for (var i = 0; i < len; i++){
                            var item = results.rows.item(i);
                            var ablesungTimestamp = item.ZAEHLER_STAND_ABLESUNG;
                            var ablesung = Date.parse(ablesungTimestamp).toString('dd.MM.yyyy HH:mm');

                            if (i == 0) {
                                listview.append('<li data-role="list-divider">' + item.ZAEHLER_ART_NAME + '<span class="ui-li-count" style="font-size: 14px;">' + len + '</span></li>');
                            }

                            listview.append('\
                                <li><a href="#zaehlerstand_bearbeiten" data-transition="flip" data-identity="' + item.ZAEHLER_STAND_ID + '" style="padding-right: 15px;">\
                                    <h2><strong>' + ablesung + ' Uhr</strong></h2>\
                                    <p><span style="font-style: italic">' + item.ZAEHLER_STAND_NOTIZ + '</span></p>\
                                    <p>' + numeral(item.ZAEHLER_STAND_STAND).format('0,0.00') + ' ' + item.ZAEHLER_ART_EINHEIT + '</p>\
                                    <p class="ui-li-aside"></p>\
                                </a></li>');
                        }
                    }
                });
            },

            function(error) {
                console.error("Error processing SQL: " + error.message);
            },

            function() {
                $("#zaehlerstand_uebersicht_listview").listview('refresh');
                $('#zaehlerstand_uebersicht_listview a').off();
                $('#zaehlerstand_uebersicht_listview a').on("click", function(event){
                    var zaehlerStandId = $(this).data("identity");
                    window.localStorage.setItem(constants.zaehlerStandId, zaehlerStandId);
                });
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

    save_zaehlerstand: function() {
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
            }
        );
    },

    update_zaehlerstand: function() {
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
            }
        );
    },

    delete_zaehlerstand: function() {
        this.open().transaction(
            // callback
            function(tx) {
                var zaehlerStandId = window.localStorage.getItem(constants.zaehlerStandId);
                tx.executeSql("DELETE FROM ZAEHLER_STAND WHERE ID = ?", [zaehlerStandId]);
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