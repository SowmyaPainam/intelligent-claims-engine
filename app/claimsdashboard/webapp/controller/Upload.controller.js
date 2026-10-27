sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox"
], function (Controller, MessageBox) {
  "use strict";

  return Controller.extend("com.company.claimsdashboard.controller.Upload", {
    onInit: function () {
      this._oFile = null;
    },

    onNavBack: function () {
      window.history.back();
    },

    onChooseFile: function () {
      var oInput = document.createElement("input");
      oInput.type = "file";
      oInput.accept = ".pdf,.png,.jpg,.jpeg";
      oInput.onchange = function (event) {
        var file = event.target.files[0];
        if (file) {
          this._oFile = file;
          this.byId("fileNameText").setText(file.name);
        }
      }.bind(this);
      oInput.click();
    },

    onUpload: function () {
      var claimId = this.byId("claimIdInput").getValue().trim();
      if (!claimId) {
        MessageBox.warning("Enter a claim ID.");
        return;
      }
      if (!this._oFile) {
        MessageBox.warning("Choose a file first.");
        return;
      }

      var oFormData = new FormData();
      oFormData.append("file", this._oFile);
      oFormData.append("claimId", claimId);

      sap.ui.core.BusyIndicator.show(0);

      fetch("/document/upload", { method: "POST", body: oFormData })
        .then(function (response) {
          if (!response.ok) {
            return response.json().then(function (body) {
              throw new Error(body.error || body.message || "Upload failed");
            });
          }
          return response.json();
        })
        .then(function (result) {
          sap.ui.core.BusyIndicator.hide();
          var msg = "Decision: " + result.decision.decision + " (" + result.decision.reason + ")";
          if (result.approvalWorkflow) {
            msg += "\nApproval workflow created: " + result.approvalWorkflow.levels + " level(s)";
          }
          MessageBox.information(msg);
        })
        .catch(function (err) {
          sap.ui.core.BusyIndicator.hide();
          MessageBox.error("Document upload failed: " + err.message);
        });
    }
  });
});