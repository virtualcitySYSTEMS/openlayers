/**
 * @license
 * Copyright (c) 2008-2013 Institut National de l'information Geographique et forestiere France, released under the
 * BSD license.
 */
/**
 * @requires OpenLayers/Format/GML/v3.js
 */
/**
 * Class: OpenLayers.Format.GML.v3_2_1
 * Parses GML version 3.2.1.
 *
 * Inherits from:
 *  - <OpenLayers.Format.GML.v3>
 */
OpenLayers.Format.GML.v3_2_1 = OpenLayers.Class(OpenLayers.Format.GML.v3, {

    /**
     * Property: namespaces
     * {Object} Mapping of namespace aliases to namespace URIs.
     */
    namespaces: {
        gml: "http://www.opengis.net/gml/3.2",
        xlink: "http://www.w3.org/1999/xlink",
        xsi: "http://www.w3.org/2001/XMLSchema-instance",
        wfs: "http://www.opengis.net/wfs/2.0", // this is a convenience for reading wfs:FeatureCollection
        iso19112: "http://www.opengis.net/iso19112" // this is a convenience for reading iso19112 Positions, geographicIdent and parent information
    },
    
    /**
     * Property: schemaLocation
     * {String} Schema location for a particular minor version.  The writers
     *     conform with the Simple Features Profile for GML.
     */
    schemaLocation: "http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.1.1/profiles/gmlsfProfile/1.0.0/gmlsf.xsd",

    /**
     * Constructor: OpenLayers.Format.GML.v3_2_1
     * Create a parser for GML v3_2_1.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     *
     * Valid options properties:
     * featureType - {String} Local (without prefix) feature typeName (required).
     * featureNS - {String} Feature namespace (required).
     * geometryName - {String} Geometry element name.
     */
    initialize: function(options) {
        OpenLayers.Format.GML.v3.prototype.initialize.apply(this, [options]);
    },

    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     */
    readers: {
        "gml": OpenLayers.Util.applyDefaults({
            "FeatureCollection": function(node, obj) { 
                obj.features = []; 
                this.readChildNodes(node, obj); 
            }
        }, OpenLayers.Format.GML.v3.prototype.readers["gml"]),            
        "feature": OpenLayers.Format.GML.v3.prototype.readers["feature"],
        "wfs": OpenLayers.Format.GML.v3.prototype.readers["wfs"],
    	"iso19112":OpenLayers.Format.GML.Base.prototype.readers["iso19112"]
    },

    /**
     * Constant: OpenLayers.Format.GML.v3_2_1
     * {String} *"OpenLayers.Format.GML.v3_2_1"*
     */
    CLASS_NAME: "OpenLayers.Format.GML.v3_2_1" 
});
