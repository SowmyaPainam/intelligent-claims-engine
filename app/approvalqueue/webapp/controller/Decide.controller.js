sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("approvalqueue.controller.Decide", {
        onInit: function () {
            this.getView().setModel(new JSONModel({ loaded: false }), "decideModel");
        },

        onNavBack: function () {
            window.history.back();
        },

        onLoad: function () {
            var sApprovalId = this.byId("approvalIdInput").getValue().trim();
            if (!sApprovalId) {
                MessageBox.error("Please enter an Approval ID.");
                return;
            }

            var sUrl = "/approval/Approvals('" + encodeURIComponent(sApprovalId) + "')?$expand=claim";

            fetch(sUrl, { headers: { Accept: "application/json" } })
                .then(function (res) {
                    if (!res.ok) {
                        throw new Error("Approval not found (HTTP " + res.status + ")");
                    }
                    return res.json();
                })
                .then(function (data) {
                    this.getView().getModel("decideModel").setData({
                        loaded: true,
                        approvalId: data.ID,
                        claimId: data.claimID,
                        level: data.level,
                        levelName: data.levelName,
                        assignedTo: data.assignedTo,
                        customerName: data.claim ? data.claim.customerName : "",
                        claimAmount: data.claim ? data.claim.claimAmount : "",
                        currency: data.claim ? data.claim.currency : "",
                        productId: data.claim ? data.claim.productId : "",
                        issueDescription: data.claim ? data.claim.issueDescription : ""
                    });
                }.bind(this))
                .catch(function (err) {
                    MessageBox.error(err.message);
                });
        },

        onSubmit: function () {
            var oData = this.getView().getModel("decideModel").getData();
            var sDecision = this.byId("decisionSelect").getSelectedKey();
            var sComments = this.byId("commentsInput").getValue();

            var oModel = this.getView().getModel();
            var oAction = oModel.bindContext("/SubmitApprovalDecision(...)", undefined, { $$groupId: "$auto" });
            oAction.setParameter("approvalId", oData.approvalId);
            oAction.setParameter("claimId", oData.claimId);
            oAction.setParameter("level", oData.level);
            oAction.setParameter("decision", sDecision);
            oAction.setParameter("comments", sComments);

            oAction.execute().then(function () {
                MessageToast.show("Decision submitted.");
                MessageBox.success("Decision recorded: " + sDecision);
                this.getView().getModel("decideModel").setData({ loaded: false });
                this.byId("approvalIdInput").setValue("");
            }.bind(this)).catch(function (err) {
                MessageBox.error("Failed to submit decision: " + (err.message || err));
            });
        }
    });
});